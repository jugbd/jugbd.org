---
title: "Java Thread Programming (Part 13)"
author: A N M Bazlur Rahman
date: 2022-02-08T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---

[Our previous article](https://foojay.io/today/java-thread-programming-part-12/) discussed different ways to create a Java thread pool and put and execute result-bearing tasks to the Pool. This article will go a bit in-depth about how many worker threads we could put in a pool to get the best result.

Using the Executors' factory class, we can create our thread pool; however, all the factory methods internally create an instance of ThreadPoolExcutors. This class is the representation of ThreadPool that we use. We can directly create a pool invoking its constructor. The constructor takes 7 arguments:

*   **corePoolSize**: the number of threads that are always alive in the Pool, even when idle.
*   **maximumPoolSize**: the maximum number of threads that the Pool allows.
*   **keepAliveTime**: if the number of the threads becomes larger than the corePoolSize, if some of them are idle, they get terminated. This is the time thread will wait before getting terminated if they are idle.
*   **timeUnit**: time unit of keepAliveArgument, if could millisecond, second, etc.
*   **workQueue**: Ideally the tasks are kept into a blocking queue. This is the queue where we put the tasks.
*   **threadFactory:** the factory that creates a new thread when needed. It creates all threads in the same ThreadGroup.
*   **handler**: the handler to use when execution is blocked because the thread bounds and queue capacities are reached; for example, if capacities are reached, we want to reject the tasks.

Let's see an example:

```
package ca.bazlur;

import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.ThreadPoolExecutor.AbortPolicy;
import java.util.concurrent.TimeUnit;

public class Experiment {


  public static void main(String\[\] args) {
    var threadPool = new ThreadPoolExecutor(5, 25, 100, TimeUnit.MILLISECONDS, new LinkedBlockingDeque<>(),
        Executors.defaultThreadFactory(), new AbortPolicy());

    for (int i = 0; i < 10; i++) {
      threadPool.submit(() -> System.out.println("Hello \\uD83C\\uDF0E"));
    }

    threadPool.shutdown();
  }
}

```

In the above ThreadPool, the minimum threads count is 5, which is when we would create the Pool, 5 threads will be created immediately, and they will be kept around, waiting for tasks, even if they are idle. If we submit a task, these existing threads will pick it up.

The ThreadPoolExecutor has multiple constructors and the Executors factory class uses the combination of these constructors and creates ThreadPool for us and makes our life a bit easy.

However, the question still remains: what would be the minimum and the maximum number that we should use? Because this very critical to get the best performance. If we put too many, that may result in detrimental to the application's performance.  
Let's discuss this a bit further.

**Setting Up the Maximum Number**
---------------------------------

So the first question would be, what would be the maximum number? Well, the answer isn't straightforward. It depends on the nature of the workload we are putting in and the hardware the application is running. It also depends on how often the individual task will block.

Let's assume we have a machine with 4 CPUs; our goal is to maximize the usages of that 4 CPUs. That means we have to have at least 4 threads. This seems evident to us as if we have more CPU available and we use less thread, which means we are basically wasting our CPU. So, we better use all of them.

Now the question gets to be, does it make sense to have more than 4?

Well, to answer that question, we have to know the nature of the workload we are putting into the Pool. The nature of workload can be compute-bound. This sort of workload doesn't make any external calls (e.g. database, API endpoint etc.). Also, they have no significant contention on a particular locking mechanism. For this sort of workload, it makes sense to have a maximum number of threads is equal to the number of CPUs. If we add more threads, that means we will have more context switching between threads. The thread scheduler would be super busy giving the time slice to each thread. Thus, the overall performance will be detrimental.

On the other hand, having more threads may yield a better result if the workload is IO-bound. Although having more threads has some penalties, most threads will be waiting for IO in an IO-bound workload. So, if we have 4 CPUs and 4 threads, eventually, they all will be waiting for IO to finish meanwhile, no work will be done. This is a waste of our precious CPU time. But, If we add more threads to the Pool, they may continue to work while others are waiting on IO.

> So now, we can safely say that if the workload is CPU intensive, adding more thread than the CPU size isn't a good idea. However, this is precisely the opposite if we have IO-bound work.

I have done an experiment with JMH (Java microbenchmark Harness) framework, and the result supports the above statement.

_Github: [https://github.com/rokon12/java-thread-programming-jhm](https://github.com/rokon12/java-thread-programming-jhm)_

Now the question is, how do we determine the exact number?

Well, it depends. There are no ideal numbers that fit all cases. So we have to do adequate testing to find out what is the best for our particular workload and application.

However, in a most typical scenario, we usually have a diverse set of tasks. And things go completed in such cases.

In "[**Java Concurrency in Practice**](https://www.amazon.ca/Java-Concurrency-Practice-Brian-Goetz/dp/0321349601/)," Brian Goetz provided a formula that we can use in most cases.

`Number of threads = Number of Available Cores * (1 + Wait time / Service time)`

**Waiting time**\-  could IO, e.g., waiting for an HTTP response, acquiring Lock, etc.

**Service Time**– is the time of computation, e.g. processing the HTTP response, marshalling/unmarshalling etc.

For example- an application calls an API and then processes it. If we have 8 processors in the application server, and then on average, the response time of the API is 100ms and the processing time of the response is 20ms, then the ideal size of thread would be –

```
N = 8 \* ( 1 + 100/20)
  = 48
```

However, this is an oversimplification; adequate testing is always critical to figure out the number.

Setting Up the Minimum Number
-----------------------------

Once the maximum number of threads in the ThreadPool has been determined, we can think about the minimum. Honestly, it doesn't even matter; in most cases, we will put the same number as the maximum number.

This is all for today. In the next article, we will discuss other aspects of ThreadPool, such as queue size and ForkJoinPool.

Don’t Forget to Share This Post!

