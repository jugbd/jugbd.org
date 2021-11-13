---
title: "Strategy Design Pattern"
author: Simanta Deb Turja
categories: Design-Patterns
tags: [design-pattern, strategy-pattern, clean-code, turja]
comments: true
image: https://i.ibb.co/YBBC7My/strategycover.png
---
**Original Post: [https://simantaturja.github.io/design-patterns/strategy-pattern/](https://simantaturja.github.io/design-patterns/strategy-pattern/)**

### Definition of Strategy Pattern

The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

আমরা Strategy Pattern সম্পর্কে জানার আগে একটা রিয়েল লাইফ প্রবলেমকে খুবই Naive ভাবে সলভ করার চেষ্টা করব।

![problem-strategy-pattern](https://i.ibb.co/ZSgjXrh/problem.png)

আমরা একটা Checkout System তৈরি করতে চাচ্ছি যাতে বিভিন্নভাবে পেমেন্ট করার অপশন থাকবে। যেমন- ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, ক্রেডিট কার্ড ইত্যাদি। এধরনের Checkout System আমরা প্রতিনিয়ত বিভিন্ন ই-কমার্স সাইটে ব্যবহার করে থাকি।

Checkout System তৈরি করার কিছু Initial Requirements আমাদের দেয়া আছে।

১। শুরুতে শুধুমাত্র Cash on delivery এবং Bkash মেথডে Pay করা যাবে।

২। Cash on delivery তে Pay করার জন্য গ্রাহককে সর্বনিম্ন ৫০০ টাকা অর্ডার করতে হবে।

আমরা যদি এই Requirements এর ভিত্তিতে Naive একটা Solution লিখার চেষ্টা করি, তাহলে কোডটা এমন হবে।

```java
package com.simantaturja.naive;

public class PaymentMethods {
    private String selectedPaymentMethod;
    public void setSelectedPaymentMethod(String s) {
        this.selectedPaymentMethod = s;
    }
    public void pay() {
        switch (selectedPaymentMethod) {
            case "COD" -> payWithCOD();
            case "Bkash" -> payWithBkash();
        }
    }
    private void payWithCOD() {
        System.out.println("Pay with COD is successful");
    }
    private void payWithBkash() {
        System.out.println("Pay with Bkash is successful");
    }
}
```

```java
package com.simantaturja.naive;

public class CheckoutSystem {
    public static void main(String... args) {
        PaymentMethods paymentMethods = new PaymentMethods();
        int orderAmount = 200;
        String selectedMethod = "COD";
        if (selectedMethod.equals("Bkash")) {
            paymentMethods.setSelectedPaymentMethod("Bkash");
            paymentMethods.pay();
        }
		else if (orderAmount >= 500 && selectedMethod.equals("COD")) {
            paymentMethods.setSelectedPaymentMethod("COD");
            paymentMethods.pay();
        }
		else {
		    System.out.println("Sorry!!Minimum 500 tk. order is required for COD");
        }
    }
}

```

- PaymentMethod class -টায় সকল ধরনের PaymentMethod এর Body ইমপ্লিমেন্ট করা আছে এবং pay method এ switch case দিয়ে চেক করা হয়েছে কোন ধরনের পেমেন্ট মেথড।
- CheckoutSystem class -টা হচ্ছে আমাদের ক্লায়েন্ট ক্লাস, অর্থ্যাৎ যে ক্লাস থেকে আমরা PaymentMethod ক্লাসটাকে ব্যবহার করছি।

এখন পর্যন্ত এই সল্যুশনে কোন ঝামেলা হওয়ার কথা না। কিন্তু ধরুন, অদূর ভবিষ্যতে আপনার এই Checkout System এ আরো কয়েকটি payment method add করতে হবে, যেমন- Nagad, SureCash, Credit Card ইত্যাদি।
সেক্ষেত্রে আপনার existing solution টাকে আপনি কিভাবে চেঞ্জ করবেন? আপনাকে অবশ্যই আপনার PaymentMethod class টাকে মডিফাই করতে হবে এবং এর মধ্যে switch case এ কিছু case যোগ করতে হবে এবং সেগুলোর মেথডও ইমপ্লিমেন্ট করতে হবে।
অর্থ্যাৎ, solution টি modify করলে এমন হবে-

```java
package com.simantaturja.naive;

public class PaymentMethods {
    private String selectedPaymentMethod;
    public void setSelectedPaymentMethod(String s) {
        this.selectedPaymentMethod = s;
    }
    public void pay() {
        switch (selectedPaymentMethod) {
            case "COD" -> payWithCOD();
            case "Bkash" -> payWithBkash();
            case "Nagad" -> payWithNagad();
            case "SureCash" -> payWithSureCash();
            case "Card" -> payWithCard();
            case "Rocket" -> payWithRocket();
        }
    }
    private void payWithCOD() {
        System.out.println("Pay with COD is successful");
    }
    private void payWithBkash() {
        System.out.println("Pay with Bkash is successful");
    }
    private void payWithNagad() {
        System.out.println("Pay with Nagad is Successful");
    }
    private void payWithCard() {
        System.out.println("Pay with Card is Successful");
    }
    private void payWithRocket() {
        System.out.println("Pay with Rocket is Successful");
    }
    private void payWithSureCash() {
        System.out.println("Pay with SureCash is Successful");
    }
}
```

এই solution এ যে ঝামেলাটা হবে সেটি হচ্ছে কোন Payment Method add করা লাগলেই আমাদের এই class টা মডিফাই করতে হচ্ছে। ধরে নিন, আপনি নতুন কোন মেথড ইমপ্লিমেন্ট করতে গিয়ে কোন একটা error create করলেন, তাতে আপনার existing paymentmethod class টাও ব্রেক করবে, যেটা আগে ঠিকঠাক রান করছিল। তাই ভালো কোড লিখার একটা শর্ত হচ্ছে, existing কোন কোড যতটা সম্ভব কম মডিফাই করা। আমরা existing class কে মডিফাই করছি, তাই আমাদের এ কোডটি অবশ্যই Open Closed Principle violate করছে।

PaymentMethod class টি একই সাথে অনেকগুলো মেথড এর পারপাস সার্ভ করছে, যা একই সাথে Single Responsibility Principle এর ও ভায়োলেশন।

আশা করি, আমাদের existing code এর প্রবলেমটা আমরা ধরতে পেরেছি।

আসুন, এবার দেখি কিভাবে Strategy Pattern ব্যবহার করে আরেকটু সুন্দরভাবে প্রবলেমটা সলভ করা যায়।

আমরা আমাদের এ solution এ একটা Strategy interface ব্যবহার করব, যে interface কে পরবর্তীতে concrete strategy class (Pay with Bkash, Pay with Nagad) - এ ধরনের ক্লাসগুলো ইমপ্লিমেন্ট করবে এবং নিজেদের মতো করে pay method টাকে ওভাররাইড করে নিবে।

```java
// PaymentStrategy.java
public interface PaymentStrategy {
    public void pay();
}
```

```java
// CODOPaymentStrategy.java (Concrete Strategy)
public class CODPaymentStrategy implements PaymentStrategy {
    @Override
    public void pay() {
        System.out.println("Pay with COD is successful");
    }
}

```

```java
// BkashPaymentMethod.java (Concrete Strategy)
public class BkashPaymentStrategy implements PaymentStrategy {
    @Override
    public void pay() {
        System.out.println("Pay with Bkash is successful");
    }
}

```

```java
// NagadPaymentMethod.java (Concrete Strategy)
public class NagadPaymentStrategy implements PaymentStrategy {
    @Override
    public void pay() {
        System.out.println("Pay with Nagad is successful");
    }
}

```

এখন যদি আমাদের নতুন কোন Payment Strategy add করাও লাগে, সেক্ষেত্রে কিন্তু আমাদের কোনো existing class এ হাত দিতে হবে না। ধরুন, আমাদের Credit Card Payment Strategy add করতে হবে। সেক্ষেত্রে, আমরা জাস্ট নতুন একটা concrete class তৈরি করব যা PaymentStrategy interface -টাকে ইমপ্লিমেন্ট করবে এবং pay method টাকে অভাররাইড করবে।

```java
// CreditCardPaymentMethod.java (Concrete Strategy)
public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public void pay() {
        System.out.println("Pay with Credit Card is successful");
    }
}

```

খুবই সিম্পল।
কিন্তু এখন আমরা এই class গুলাকে ব্যবহার করব কিভাবে? আমরা এই ক্লাসগুলোকে আমাদের আগের CheckoutSystem class থেকেই ব্যবহার করব, তবে একটা context class এর সাহায্যে। context class এর কাজ হবে, কোন একটা paymentstrategy কে execute করা। আমরা এইটাকে আলাদা একটা লেয়ারের abstraction হিসেবে চিন্তা করতে পারি।

আমাদের context class টা দেখতে এমন হবে।

```java
// This is the context class
public class PaymentMethods {
    PaymentStrategy paymentStrategy;

    public void setStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }
    public void executeStrategy() {
        paymentStrategy.pay();
    }
}

```

এবং CheckoutSystem class টা এমন-

```java
public class CheckoutSystem {
    public static void main(String... args) {
        PaymentMethods paymentMethods = new PaymentMethods();
        int orderAmount = 500;
        String selectedMethod = "COD";
        if (selectedMethod.equals("Bkash")) {
            paymentMethods.setStrategy(new BkashPaymentStrategy());
            paymentMethods.executeStrategy();
        } else if (selectedMethod.equals("Nagad")) {
            paymentMethods.setStrategy(new NagadPaymentStrategy());
            paymentMethods.executeStrategy();
        } else if (selectedMethod.equals("Card")) {
            paymentMethods.setStrategy(new CreditCardPaymentStrategy());
            paymentMethods.executeStrategy();
        } else if (orderAmount >= 500 && selectedMethod.equals("COD")) {
            paymentMethods.setStrategy(new CODPaymentStrategy());
            paymentMethods.executeStrategy();
        } else {
            System.out.println("Sorry! Minimum 500tk order is required for COD”);
        }
    }
}

```

আমরা context class এর মাধ্যমে একটা Strategy set করে দিচ্ছি এবং পরবর্তীতে ঐ particular strategy এর pay method-টাকে call করে দিচ্ছি।

এখন যদি আমাদের আরো হাজারটা payment strategy ও যোগ করা লাগে, তাহলেও কিন্তু কোন সমস্যা হবে না। আমাদের কোন existing class এই হাত দিতে হবে না। আমরা জাস্ট interface টাকে implement করে কাজ করতে পারব এবং খেয়ার করলে দেখবেন আমরা কিন্তু আমাদের আগের solution এর PaymentMethod class এর switch case বা if-else কে রিমুভ করে ফেলতে পেরেছি।

আমরা কিন্তু আগেও CheckoutSystem class টাতে মডিফাই করতে হচ্ছিল, এখন ঠিক একইভাবে করতে হচ্ছে। এ ক্লাসে কোন পরিবর্তন আসে নি। CheckoutSystem class টা থেকে যেহেতু অন্য ক্লাস গুলো call হচ্ছে, খুব স্বাভাবিক ভাবেই এই ক্লাসে কিন্তু কিছু complexity থেকেই যাবে। আমরা এখানে Strategy Pattern এর মাধ্যমে PaymentMethod class এর কমপ্লেক্সিটি দূর করতে পেরেছি এবং কোডকে More readable, more modular করতে পেরেছি।

আমরা এতক্ষণ যে solution টা নিয়ে কথা বললাম, সেটাকে যদি UML Diagram দিয়ে visualize করার চেষ্টা করি, তাহলে এমন দেখাবে।
![uml-strategy-pattern](https://i.ibb.co/k3PHFdd/uml-strategy.png)

Full Code Implementation: [Github Link](https://github.com/simantaturja/Design-Patterns-Implementation/tree/master/StrategyPatternJavaImplementation)

কেউ Strategy Pattern এবং অন্যান্য Design Patterns নিয়ে আরো পড়াশুনা করতে চাইলে, নিচের লিংকগুলা চেক করতে পারেন-

1. Refactoring Guru: [https://refactoring.guru/design-patterns/](https://refactoring.guru/design-patterns/)

2. Head First Design Patterns Book (2nd Ed.): [Book Link](https://www.amazon.com/Head-First-Design-Patterns-Object-Oriented/dp/149207800X/)

3. SpringFramework Guru: (Discussed GoF Book Patterns): [https://springframework.guru/gang-of-four-design-patterns/](https://springframework.guru/gang-of-four-design-patterns/)

