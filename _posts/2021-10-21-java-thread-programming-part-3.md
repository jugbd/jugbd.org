---
title: "Java Thread Programming (Part 3)"
author: A N M Bazlur Rahman
date: 2021-10-21T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---
This article was first published in [Foojay.io](https://foojay.io/today/java-thread-programming-part-3/)

Continuing [from part 2](https://bazlur.com/2021/10/java-thread-programming-part-2/), let’s start this article with a bit of context first (_and if you don’t like reading text, you can skip this introduction, and go directly to the section below where I discuss pieces of code_).

Context
-------

*   When we start an application program, the operating system creates a process.
*   Each process has a unique id (we call it PID) and a memory boundary.
*   A process allocates its required memory from the main memory, and it manipulates data within a boundary.
*   No other process can access the allocated memory that is already acquired by a process.
*   It works like a sandbox, and in that way avoids processes stepping on one another's foot.
*   Ideally, we can have many small processes to run multiple things simultaneously on our computers and let the operating systems scheduler schedule them as it sees fit.
*   In fact, this is how it was done before the development of threads. However, when we want to do large pieces of work, breaking them into smaller pieces, we need to accumulate them once they are finished.
*   And not all tiny pieces can be independent, some of them must rely on each other, and thus we need to share information amongst them.
*   To do that, we use inter-process communication. The problem with this idea is that having too many processes on a computer and then communicating with each other isn’t cheap. And precisely that is where the notion of threads comes into the picture.

The idea of the thread is that a process can have many tiny processes within itself. These small processes can share the memory space that a process acquires. These little processes are called a thread. So the bottom line is, threads are independent execution environments in the CPU and share the same memory space. That allows them faster memory access and better performance.

That seems to be a good idea. However, it comes with many problems alongside its benefits. Let’s discuss some of those problems and how we can deal with them. But don’t get discouraged, the benefits still outweigh the problems!

Code
----

Let’s begin by running a piece of code.

```java
package com.bazlur.threads;

public class FoojayPlayground {
 private static boolean running = false;

 public static void main(String[] args) {
  var t1 = new Thread(() -> {
   while (!running) {
   }
   System.out.println("Foojay.io");
  });

  var t2 = new Thread(() -> {
   running = true;
   System.out.println("I love ");
  });

  t1.start();
  t2.start();
 }
}
```

The above piece of code is reasonably straightforward. We have created two threads. Both of them share a variable named "running". There is a while loop inside the first thread. The loop will keep running while the variable is false, which means this thread will continue to execute the loop unless the variable is changed. Once the loop breaks, it prints “Foojay.io.” The second thread changes the variable and then prints “I love.”

Now the question gets to be, what would be the output?

Outwardly it seems the output would be following:

```textmate
I love 
Foojay.io
```

Well, that’s only one case because if you run the above code several times, you will see different results. There would be three outcomes of the program, varying on different computers. The reason is, we can only ask the thread to execute a piece of code, but **we cannot guarantee the execution order of multiple threads**. Threads are scheduled by the operating system's thread scheduler. We will discuss the thread’s lifecycle in forthcoming articles.

**Case 1.** The first thread will continue running the loop. In contrast, the second thread will change the variable and immediately print “I love”. Since the variable now changed, the loop breaks, and it prints “Foojay.io”, so that the output is:

```textmate
I love 
Foojay.io
```

**Case 2.** The second thread will run first and change the variable and then immediately in the first thread, the loop will break and print the “Foojay.io”. And the second thread will print “I love”. Thus the output is:

```textmate
Foojay.io 
I love
```

**Case 3.** The above two cases seem reasonable. **However, there is a third case that we may not anticipate immediately:** the first thread may be stuck and the second thread will print “I love” and that’s all. No more output. This can be difficult to reproduce, but it can happen.

Let me explain the third case!

We know the modern computer has multiple CPUs in it. Nonetheless, we cannot guarantee in which core the thread will eventually run. For example, the above two threads can run in two different CPUs, which most likely the case.

When a CPU executes a code, it reads data from the main memory. However, modern CPUs have various caches for faster access to memory. There are three types of cache associated with each CPU. They are L1 Cache, L2 Cache, and L3 Cache.

![](/img/Cache-678x510.png)

When starting the first thread, the CPU it runs may cache the running variable and keeps it running. But, on the other hand, when the second thread runs and changes the variable on a different CPU, it won’t be visible to the first thread. Thus the problem of the third case would occur.

We cannot tell whether this would be the case because it all depends on the operating system and having multiple CPUs in a computer. Despite this, we can prevent the CPU from caching, by using "volatile" in the variable. This will instruct the CPU not to cache the variable and, instead, it will read it from the main memory:

```java
public class FoojayPlayground {
   private static volatile boolean running = false;
   ...
   ...
}
```

Now, if we run the above program, the third case will not happen.

The above problem is called the visibility problem. There are a few similar problems that deal with the visibility issue.

We will discuss them in the following articles!

That’s it for today!

Don’t Forget to Share This Post!

