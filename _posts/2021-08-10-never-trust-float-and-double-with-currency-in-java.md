---
title: Never Trust Float & Double with Currency in Java
author: Ayon Khan
date: 2021-08-10 02:45:00 +0600
categories:
- java
- programming
comments: true
tags:
- java
- float
- double
- currency
- floating point
- ieee 754
- ieee
- bigdecimal
- decimal
- money
image: 'https://uploads.ayonkhan.me/file/baquet/posts/2021-08-never-trust-float-and-double-with-currency-in-java/pexels-cottonbro-5483064-min.jpg'

---

*Photo by cottonbro from Pexels*

**Original Post: [https://www.ayonkhan.me/posts/2021/08/never-trust-float-and-double-with-currency-in-java/](https://www.ayonkhan.me/posts/2021/08/never-trust-float-and-double-with-currency-in-java/)**

The float and double types are the worst candidates for monetary calculations. In this post, you will see why and how you can remedy the problem.

___

## Introduction

The `float` and `double` are probably your go-to data types for floating-point numbers, especially if you are new to Java. It's fine unless you're using these types for storing precise values such as currency. Even the Java documentation advises against using these types for such values. You are welcome to look it up.

## Understanding the Problem

> 95% of the folks out there are completely clueless about floating-point.
>
> — <cite>James Gosling, Sun Fellow, Java Inventor (February 28, 1998)[^1]</cite>

[^1]: [How Java's Floating-Point Hurts Everyone Everywhere](https://people.eecs.berkeley.edu/~wkahan/JAVAhurt.pdf)

To understand the problem, let's look at an example first.

```java
double x = 0.1;
double y = 0.2;

System.out.println(x + y); // 0.30000000000000004
```

Weirdly, the output is not `0.3`, but `0.30000000000000004`.

You may have come across this example before. Anyway, let's look at another one.

```java
double x = 0.2;

for (int i = 0; i < 100; i++) {
    x += 0.2;
}

System.out.println(x); // 20.19999999999996
```

Again, we are not getting our expected output of `20.2`. One last example.

```java
double x = 4.35;

System.out.println(x * 100); // 434.99999999999994
```

In this case, we were expecting `435.0` but ended up getting `434.99999999999994`.

These are some common examples used to demonstrate the loss of significance in floating-point arithmetic. I'm sure you can imagine this behavior can lead to some unexpected errors.

> **The `float` and `double` types are particularly ill-suited for monetary calculations** because it is impossible to represent 0.1 (or any other negative power of ten) as a `float` or `double` exactly.
>
> — <cite>Joshua Bloch, Effective Java, Third Edition[^2]</cite>

[^2]: [Effective Java, Third Edition](https://www.oreilly.com/library/view/effective-java/9780134686097/)

Now I'm not going to go into details but know this, floating-point numbers are relatively complex for computers to express as they store floating-point numbers as base-2 fractions. Many programming languages, including Java, adopted IEEE 754 standard for their floating-point numbers. Even though this standard addresses many problems, we still cannot reliably use floating-point numbers to represent currency.

![comic](https://uploads.ayonkhan.me/file/baquet/posts/2021-08-never-trust-float-and-double-with-currency-in-java/e_to_the_pi_minus_pi.png)
*xkcd (#217): e to the pi Minus pi*

Head over to [this site](https://www.explainxkcd.com/wiki/index.php/217:_e_to_the_pi_Minus_pi) for the explanation if you didn't get it. You can also run it on your machine `Math.pow(Math.E, Math.PI) - Math.PI`.

**As a rule of thumb, we should avoid these types for monetary calculations.**

## The Solution: BigDecimal

Java platform provides a `BigDecimal` **immutable** class that can deal with high-precision floating-point numbers.

There are many ways we can initialize a `BigDecimal` instance. To use `BigDecimal`, we need to import `java.math.BigDecimal` class.

```java
// String as an argument (high-precision)
BigDecimal a = new BigDecimal("0.1");
System.out.println(a); // 0.1

// Double as an argument (should be avoided)
BigDecimal b = new BigDecimal(0.1); // Unpredictable 'new BigDecimal()' call
System.out.println(b); // 0.1000000000000000055511151231257827021181583404541015625

// If we need to pass double as an argument
// Beware, it has limited precision than the String constructor
BigDecimal c = new BigDecimal(Double.toString(0.1));
System.out.println(c); // 0.1

// Alternatively, we can do this (this too has limited precision)
BigDecimal d = BigDecimal.valueOf(0.1);
System.out.println(d); // 0.1
```

As we can see, `BigDecimal(double val)` can give an unpredictable result. Therefore, `BigDecimal(String val)` is preferred over the one that accepts a double.

### Arithmetic Operations

Another thing we need to know is that we cannot perform arithmetic operations on `BigDecimal` instances using the `+`, `-`, `*`, `/` operators. Instead, we need to call `add()`, `subtract()`, `multiply()`, `divide()` methods of `BigDecimal` objects.

### BigDecimal in Action

Now let's tackle the problems we discussed in the earlier examples with `BigDecimal`.

```java
// Example 1
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = BigDecimal.valueOf(0.2);

System.out.println(a.add(b)); // 0.3

// Example 2
BigDecimal c = new BigDecimal(Double.toString(0.2));

for (int i = 0; i < 100; i++) {
    // BigDecimal objects are immutable as mentioned before
    // So, calling add() on "c" will not update the value of "c"
    // We need to assign the result of the arithmetic operation
    c = c.add(new BigDecimal("0.2"));
}

System.out.println(c); // 20.2

// Example 3
BigDecimal d = new BigDecimal(Double.toString(4.35));

System.out.println(d.multiply(new BigDecimal("100"))); // 435.00
```

That's awesome, right? Well, sort of, cause now you might be wondering why we got `435.00` and not `435.0` from the multiplication like the other ones. For this, we need to understand something called scale.

### Scale & Precision

Scale is the number of digits right to the decimal point. So, if the number is `3.141`, then the scale is 3. Meanwhile, the precision is 4 as it indicates the total number of digits.

#### Preferred Scales for Arithmetic Operations

By default, each arithmetic operation uses its preferred scale for representing a result. For example, when multiplying two numbers, the scale is – the sum of the scales of both numbers. Let me borrow a table from the Java documentation for better illustration.

**Table: Preferred Scales for Results of Arithmetic Operations[^3]**

[^3]: [BigDecimal (Java SE 11 & JDK 11 )](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/math/BigDecimal.html)

| Operation   | Preferred Scale of Result                 |
|-------------|-------------------------------------------|
| Add         | max(addend.scale(), augend.scale())       |
| Subtract    | max(minuend.scale(), subtrahend.scale())  |
| Multiply    | multiplier.scale() + multiplicand.scale() |
| Divide      | dividend.scale() - divisor.scale()        |
| Square root | radicand.scale()/2                        |

#### Setting the Scale & Rounding Mode

We can use `setScale(int newScale, RoundingMode roundingMode)` method to explicitly set the scale. We need to provide the rounding mode along with the scale so that it knows how to round the number. There are 8 different rounding modes available in the `java.math.RoundingMode` enum. Refer to [this documentation](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/math/RoundingMode.html) for details on the rounding modes.

```java
// import java.math.RoundingMode

BigDecimal x = BigDecimal.valueOf(32.128);

x = x.setScale(2, RoundingMode.HALF_UP);

System.out.println(x); // 32.13
```

### Comparing BigDecimal Objects: equals() vs compareTo()

Knowing how to perform arithmetic operations is not enough. It's equally (no pun intended) important to understand how to compare two `BigDecimal` objects. You may be tempted to use the `equals(Object x)` method, but bear in mind, this method only returns `true` if both numbers are equal in value and scale.

```java
BigDecimal x = BigDecimal.valueOf(128);
BigDecimal y = BigDecimal.valueOf(128.00);
BigDecimal z = BigDecimal.valueOf(128);

System.out.println(x.equals(y)); // false
System.out.println(x.equals(z)); // true
```
I hope it's clear that we simply cannot depend on `equals(Object x)` method for value comparison. For that, we have `compareTo(BigDecimal val)` method.

```java
BigDecimal x = BigDecimal.valueOf(128);
BigDecimal y = BigDecimal.valueOf(128.00);
BigDecimal z = BigDecimal.valueOf(128);

System.out.println(x.compareTo(y)); // 0
System.out.println(x.compareTo(z)); // 0
```

Unlike `equals(Object x)`, this method doesn't return a boolean. Why? Well, that's because this method comes from the `Comparable<T>` interface implementation, and it needs to return an `int` as declared in the contract. Now, this could be a positive/negative number or zero. The following example shows what these different values represent and how we can leverage them for comparisons.

```java
BigDecimal x = BigDecimal.valueOf(64.96);
BigDecimal y = BigDecimal.valueOf(16.32);

// Positive number (1) indicates the value of "x" is greater than the value of "y"
// Zero (0) indicates the value of "x" is equal to the value of "y"
// Negative number (-1) indicates the value of "x" is less than the value of "y"
System.out.println(x.compareTo(y)); // 1

// The value of "x" is not less than the value of "y"
System.out.println(x.compareTo(y) < 0); // false

// The value of "x" is not equal to the value of "y"
System.out.println(x.compareTo(y) == 0); // false

// The value of "x" is greater than the value of "y"
System.out.println(x.compareTo(y) > 0); // true

// The value of "x" is greater than or equal to the value of "y"
System.out.println(x.compareTo(y) >= 0); // true

// The value of "x" is not equal to the value of "y"
System.out.println(x.compareTo(y) != 0); // true

// The value of "x" is not less than or equal to the value of "y"
System.out.println(x.compareTo(y) <= 0); // false
```

### Formatting Numbers as Currency

Before finishing this post, I want to address one more thing: formatting numbers as currency. There's a `NumberFormat` class that we can use for this.

First, we need to import the following classes before proceeding with the examples.

- `java.text.NumberFormat`
- `java.util.Locale`

```java
BigDecimal amount = new BigDecimal("1024.64");

String cadAmount = NumberFormat.getCurrencyInstance(Locale.CANADA).format(amount);

System.out.println(cadAmount); // $1,024.64
```

If a built-in locale is not available for a country, one can be constructed very easily. Let's see how.

```java
BigDecimal amount = new BigDecimal("1024.64");

// Locale(@NotNull String language, @NotNull String country)
Locale bangladesh = new Locale("en", "bd"); // or "bn" instead of "en"
String bdtAmount = NumberFormat.getCurrencyInstance(bangladesh).format(amount);

System.out.println(bdtAmount); // BDT1,024.64
```

Now I'll leave it up to you to figure out how you can apply rounding mode here. It shouldn't be too difficult for you at this point.

## Conclusion

`BigDecimal` by no means is the only way to deal with money and currency in Java. Also, it has some caveats. It's not as performant as a `float` or a `double` and takes a more significant toll on memory. It's merely a class designed to be used in areas that require a high degree of precision. There are some monetary APIs that can represent money and perform extensive calculations.[^4] Over the years, people have also come up with different techniques or patterns, such as storing the currency's smallest unit, which can suffer from memory overflow issues.[^5]

[^4]: [JSR 354: The Java Money API](https://blog.avenuecode.com/jsr-354-the-java-money-api)
[^5]: [You better work in cents, not dollars](https://blog.agentrisk.com/you-better-work-in-cents-not-dollars-2edb52cdf308)

We need to consider a lot of edge cases when working with currency. Take converting a currency to a different one (USD to CAD), for instance. In cases like this, we could still fall into the trap of rounding errors if we don't consider it before assigning the values.

To sum it up, if `BigDecimal` is used correctly, it can solve many issues that we encounter with monetary calculations.
