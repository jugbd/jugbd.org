---
title: "Java Thread Programming (Part 8)"
author: A N M Bazlur Rahman
date: 2021-12-06T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---


December 07, 2021

The term thread safety is a frequently and commonly pronounced word among Java developers. However, it is still one of the misunderstood terms as well. In this article, I will try to explain in a very simplified way what it is and how we can achieve it while we write our day-to-day code.

The idea is, when writing a piece of code, it usually contains method and data. If we write a class, it may hold some data in terms of state. For example, if we want to write a Counter class, we will have a variable inside the counter class that holds the current count.

```
package ca.bazlur.playground;

public class Counter {
  private int count;

  public int incrementAndGet() {
    return ++count;
  }

  public int decrementAndGet() {
    return --count;
  }

  public int getCount() {
    return count;
  }
}
```

Let's assume the above code is the most straightforward implementation of our counter. It can increment and decrement a value. Now the question is, is the above code is thread-safe?

The answer can be tricky. First of all, we have to define what we mean by thread safety. There could be many formal definitions, but in simplest terms, thread safety is, if the above class is used in a multithreaded environment, no matter what happens with the thread scheduler or how the threads are getting executed, the program will produce a correct result. It means that if the method incrementAndGet() is called 100 times from different threads, the counter's value has to be 100, not a different one. If this class guarantees this, then we can call this class a thread-safe class.

So what is the answer to the question? Is it thread-safe? Let's figure it out.

```
package ca.bazlur.playground;

public class CounterDemo {
  public static void main(String\[\] args) throws InterruptedException {
    var counter = new Counter();

    var t1 = new Thread(() -> {
      for (int i = 0; i < 1000; i++) {
        counter.incrementAndGet();
      }
    });

    var t2 = new Thread(() -> {
      for (int i = 0; i < 1000; i++) {
        counter.incrementAndGet();
      }
    });

    t1.start();
    t2.start();

    t1.join();
    t2.join();

    int count = counter.getCount();
    System.out.println("count = " + count);
  }
}
```

In the above code, we have created two threads, and each of them calls the incrementAndGet() method 1000 times. So the expected correctness of this program would be, the count variable will be 2000 when it finishes.

Unfortunately, that's not the outcome we have found. Every time we run it, we get a different result. That means this class isn't thread-safe. However, let's run this code on a single-threaded environment. It, in fact, always provide a correct result, no matter how many times we run it.

So what have we found so far?  
A simple code seems totally correct in a single-threaded environment but acts entirely differently in a multithreaded environment.

So how can we make it thread-safe?

There are three possible answers to the questions-

*   The first one is not making it thread-safe at all. After all, who wants toil, right? This is only possible; if each thread uses its own counter, and no data is shared between multiple threads, we don't have to make it thread-safe. While this may be possible in some cases, but not really a solution to the problem we are discussing here. So let's see what we have in the next option.
*   Share the data, but not allow any thread to change them. So if we can make a class immutable, then all threads will just read the data, but if they cannot change it, we have a solution. Unfortunately, this may work for many cases, but clearly not a solution for the counter-class we have written here.
*   The third option is, doing proper synchronization.

So the third option only makes sense for this case; however, the other two options are legitimate solutions in many cases. Perhaps we can discuss them some other time.

Let's do the synchronization in the counter class.

I use locking around the shared variable count while it's accessed or written, then the problem goes away.

```
package ca.bazlur.playground;

public class Counter {
  private int count;
  private final Object lock = new Object();

  public int incrementAndGet() {
    synchronized (lock) {
      return ++count;
    }
  }

  public int decrementAndGet() {
    synchronized (lock) {
      return --count;
    }
  }

  public int getCount() {
    synchronized (lock) {
      return count;
    }
  }
}
```

So we fixed our problem using a locking mechanism. I have discussed different synchronization mechanisms and thread-related problems in previous articles of the series. You will get to know more if you read them.

Nonetheless, this seems, whenever we write a piece of code, we have to make sure its correctness. This could seem daunting for our day-to-day work. What if we have a set of the library already there built-in, and we can just use them for our purpose? The good news is that we have that set of library classes readily available in JDK. We can just use them without being involved in making sure of correctness.

In JDK, there is a package named java.util.concurrent. It has many classes which are thread-safe and easy to use.

Today, since we have used counterexample in the above, let's discuss a similar class from the concurrent package.

**AtomicInteger:**

We can use this class if we ever need a counter that will run in a multithreaded environment. This is class thread-safe and performant as well. It has many methods that can serve our most needs. Example:

```
package ca.bazlur.playground;

import java.util.concurrent.atomic.AtomicInteger;

public class AtomicIntegerDemo {
  public static void main(String\[\] args) throws InterruptedException {
    var counter = new AtomicInteger();

    var t1 = new Thread(() -> {
      for (int i = 0; i < 1000; i++) {
        counter.incrementAndGet();
      }
    });

    var t2 = new Thread(() -> {
      for (int i = 0; i < 1000; i++) {
        counter.incrementAndGet();
      }
    });

    t1.start();
    t2.start();

    t1.join();
    t2.join();

    int count = counter.get();
    System.out.println("count = " + count);
  }
}
```

Similarly, if we need a large counter, we can use AtomicLong.

That's all for today. In our next article, we will discuss a few more essential classes in our day-to-day coding, available in the concurrent packages.

Don’t Forget to Share This Post!

