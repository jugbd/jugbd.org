---
title: "Java Thread Programming (Part 1)"
author: A N M Bazlur Rahman
date: 2021-10-07T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]
comments: true

---
This article was first published in [Foojay.io](https://foojay.io/today/java-thread-programming-part-1/)

What is a Thread?
-----------------

We write code in a file line by line, and then it gets executed. To be able to execute a piece of code requires an execution environment. In Java, **a thread is an execution environment**. If a program has only one execution environment, then we call this program a single-threaded program.

Interestingly, in Java, we can create a lot of threads to run different parts of the code of a program executing independently. And when we have achieved that, we call it a multi-threaded program.

In short, **a thread executes a piece of code on a computer**.

What are some benefits of multiple threads?
-------------------------------------------

The benefits of having multiple threads are enormous. Think about a web application that serves hundreds of users at a time, then the question would be, how it does it do that? Well, the answer is simple: it usually runs different requests on a separate thread. So each user gets a thread to execute their request.

Similarly, when I’m typing on this computer on a word processor, it’s doing multiple things simultaneously. One is perhaps checking my spelling, and one is possibly taking input from when I type on the keyboard. That way, we can achieve various tasks simultaneously. Otherwise, if the word processor would be a single-threaded program, it would need to first read input from the keyboard, and then only it would check the spelling. Naturally, then, the experience wouldn’t be pleasant, at all.

Why do we need to learn about threads?
--------------------------------------

We could think of many more similar examples in addition to the one mentioned above, but let’s think about the current computer architecture. The modern computer comes with multiple cores, since clock speed isn’t increasing anymore nowadays. The laptop I’m using at this moment has 16 cores. That means that at a point in time, it can run 16 different things. If a program is single-threaded, then it can only utilize 1 core at the moment, the rest of the 15 would be just idle. We shouldn’t waste valuable resources like this.

So, we should be able to write our program in a way to utilize the available resources in the best possible way. On the other hand, if an application can do multiple things at once, we can achieve substantial progress quickly, and the application can become more responsive. We can even subdivide a program into various independent units and then execute them in parallel, resulting in faster results.

Do all Java programs have a thread associated with them?
--------------------------------------------------------

The answer is yes. Java was designed to have threads from the very beginning. If we just start a "hello world" program in the main method, it will be executed through a thread, which is called the "main Thread". Let’s see an example:

```java
package com.bazlur;

public class HelloWorld {
 public static void main(String[] args) {
  System.out.println("This program is running on: " + Thread.currentThread());
  System.out.println("Hello world");
 }
}
```

**Note:** `Thread.currrentThread()` method returns the reference of the Thread currently executing the piece of code.

If we run the above program, then we will get the following output in the console:

```textmate
This program is running on: Thread[main,5,main]
Hello world
```

So, the output ensures us that running a Java program is all about running its different pieces of code on one or multiple threads.

How do I create my own threads?
-------------------------------

The code that writes in the main method executes by means of the main Thread. However, we can have more threads to run multiple pieces of code at once. There are two ways of creating threads:

*   Through extending the `java.lang.Thread` class
*   Through an interface called `java.lang.Runnable`

Let’s start by extending the Thread class.

```java
package com.bazlur;

public class MyThread extends Thread {
 @Override
 public void run() {
  System.out.println("Executing code from: " + Thread.currentThread());
  System.out.println("Hello world");
 }
}
```
In the above code, we have created a class, `MyThread`, extending the `Thread` class, and then we override the run method. Thus, whatever we write in this run method will be executed by this `Thread`.

To use this Thread, we have to create an instance and then call its `start()` method:

```java
package com.bazlur;

public class Playground {
 public static void main(String[] args) {
  System.out.println("Creating a new thread from : " + Thread.currentThread());
  var myThread = new MyThread();
  myThread.start();
  System.out.println("Leaving from: " + Thread.currentThread());
 }
}
```

In the above code, the main method gets executed by the main Thread. The main Thread sees the code that instantiates a Thread object, so it does. Then it executes its `start()` method. Since there is no more code after it, the main Thread exits here. On the other hand, the `MyThread` keeps running its code until it finishes its work.

Here, you have to keep in mind, when starting a thread, you must call the `start()` method, not the `run()` method. This is because the start method initializes the Thread and then calls the `run()` method. So, that means the platform that constructs the Thread calls the run method, not us as programmers. This information is very crucial to remember.

The above code will result following output:

```textmate
Creating a new thread from : Thread[main,5,main]
Leaving from: Thread[main,5,main]
Executing code from: Thread[Thread-0,5,main]
Hello world
```

So, the steps are:

*   Create a class extending the `java.lang.Thread` class
*   Override the `run()` method in it.
*   Put the code that you want to be executed by this Thread in the run method.
*   Create an instance of this class and then call `start()` method of its instance. That’s it.

The other way is to have an implementation of the `Runnable` interface. For example:

```java
package com.bazlur;

public class MyRunnable implements Runnable{
 @Override
 public void run() {
  System.out.println("Executing code using Runnable from: " + Thread.currentThread());
  System.out.println("Hello world");
 }
}
```

In the above class, we have implemented the runnable interface, and put our desired code in the run method.

The next steps is to create an instance of java.lang.Thread. We will put an instance of the MyRunnable class as an argument to the constructor of the `java.lang.Thread`. Then we call the start method:

```java
package com.bazlur;

public class Playground {
 public static void main(String[] args) {
  System.out.println("Creating a new thread from : " + Thread.currentThread());

  var myRunnable = new MyRunnable();
  var thread = new Thread(myRunnable);
  thread.start();
  System.out.println("Leaving from: " + Thread.currentThread());
 }
}
```
The above code will result following output:

```textmate
Creating a new thread from : Thread[main,5,main]
Leaving from: Thread[main,5,main]
Executing code using Runnable from: Thread[Thread-0,5,main]
Hello world
```

So, the steps are:

*   Create a class that implements a `java.lang.Runnable` interface.
*   Put your desired code in the `run()` method.
*   Create an instance of the class that implements the Runnable interface.
*   Use this instance as an argument of `java.lang.Thread`’s constructor and create an instance of it.
*   Call the `start()` method of the newly created instance of Thread.

That’s it.

Alternatively, you can use an anonymous inner class, and put this as an argument of the Thread’s constructor. Example:

```java
var thread = new Thread(new Runnable() {
@Override
 public void run() {
  System.out.println("Executing code using Runnable from: " + Thread.currentThread());
  System.out.println("Hello world");
 }
});
thread.start();
```

Or, even, you can use lambda expression, since the `Runnable` interface has a SAM (single abstract method). Example:

```java
var thread = new Thread(() -> {
 System.out.println("Executing code using Runnable from: " + Thread.currentThread());
 System.out.println("Hello world");
});
thread.start();
```

That’s it for today!

Don’t Forget to Share This Post!

