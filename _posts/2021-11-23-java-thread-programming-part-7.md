---
title: "Java Thread Programming (Part 7)"
author: A N M Bazlur Rahman
date: 2021-11-23T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---

**In [our previous Java threading articles in this series](https://foojay.io/today/author/bazlur-rahman/), we learned a great deal about how we can create threads and how to use them while avoiding the issues that come with them. But what does this leave us with? Can we create as many threads as we want? I wish I could answer this with a straight yes or no. In this article, I will try to come up with an answer via an exercise, so bear with me!**

When we create a thread, it allocates memory from the heap. By default, it is 1 MB. That means if we run a Java process, we cannot create as many threads as we want because it is constrained by the available memory in the first place.

Secondly, let's say we have 4 cores in our CPU, and as we know, the CPU runs one thread at a time, and the thread scheduler schedules the threads. So 4 threads will run at a point in time. More threads mean that the thread scheduler would have to schedule them, and each will get less time.

While running only 4 at a time, the rest of them will be waiting. Thus, even though we add more threads to the CPU, the effectiveness won't increase; rather, it will start degrading as we add more threads. Besides, creating a thread has an overhead other than just allocating memory. It requires system calls to create a native thread with the host OS.

> Note, Java threads are just a thin wrapper of native threads. Java doesn't have its own threads.

Let's do an experiment and see how many threads we can create:

```
package com.bazlur.threads;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.LockSupport;

public class ThreadCreationDemo {
  public static void main(String\[\] args) {
    var counter = new AtomicInteger();
    while (true) {
      new Thread(() -> {
        int count = counter.incrementAndGet();
        System.out.println("count = " + count);
        LockSupport.park();
      }).start();
    }
  }
}
```

The above program creates a thread in a while loop, prints the current thread count, and disables it to not get scheduled. The purpose of the demo is just to count how many threads we can create. I ran this program with only 4 GB heap, and I was able to create 4065 threads before it ran out of memory and threw error.

The count very much depends on the memory available and OS. So you may get a different count in your machine.

The point is, threads are limited, and we can not just create as many as we want. And creating threads are expensive. Creating them on an ad hoc basis may hurt the performance of the program overall.

Now let's imagine in our program if we have many small units of tasks, what would be the best way to get better performance. But, at the same time, we don't have to create many threads on an ad hoc basis?

What if we create a bunch of threads at a time, and we reuse them? That way, we don't have to create many threads, and we create them only once. Sounds like a great idea to me, and this has a name which we called ThreadPool.

The idea is, we will have a pool of threads waiting for us, and we will use them on a need basis, but we create them only once, perhaps when our program starts. And that's it.

Let's do an exercise about creating a thread pool-

In this exercise, we will use all of the knowledge that we have learned from the previous article so far.

```
package com.bazlur.threads;

public interface ThreadPool {
  void submit(Runnable unitOfWork);

  void shutdown();
}
```

So the idea is for there to be a ThreadPool class that we would instantiate with a pool size. And then we keep submitting our work to it. The ThreadPool will create a number of threads and keep it running inside the number. As soon as we put a task in it, they will start executing them. If they finish executing all tasks, they will wait for more tasks. When we call the shutdown method, only then the pool will stop working. Sounds simple, isn't it?

So let's implement the above interface.

```
package com.bazlur.threads;

import java.util.LinkedList;
import java.util.List;

public class MyThreadPool implements ThreadPool {
  private volatile boolean running = true;

  private final List<Runnable> tasks = new LinkedList<>();

  public MyThreadPool(int poolSize) {
    for (int i = 0; i < poolSize; i++) {
      var workerThread = new WorkerThread("worker-" + i);
      workerThread.start();
    }
  }

  private Runnable take() throws InterruptedException {
    synchronized (tasks) {
      while (tasks.isEmpty()) {
        tasks.wait();
      }

      return tasks.remove(0);
    }
  }

  @Override
  public void submit(Runnable unitOfWork) {
    synchronized (tasks) {
      tasks.add(unitOfWork);
      tasks.notifyAll();
    }
  }

  @Override
  public void shutdown() {
    this.running = false;
  }

  private class WorkerThread extends Thread {
    public WorkerThread(String name) {
      super(name);
    }

    @Override
    public void run() {
      while (running) {
        try {
          Runnable currentTask = take();
          currentTask.run();
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    }
  }
}
```

Glance over the above code. In the constructor, we take a pool size and then create threads with it. We have an internal data structure called tasks. When we submit the task, it is stored in this list so that threads can take them from it.

We have two methods here, one is, `take()`, another is `submit()`. The submit method is straightforward. We just put our tasks in the form of Runnable into the list. However, since we have a multithreaded situation here, and every thread uses this shared task variable, we must synchronize it wherever the read or write operation happens. We can use any object as a lock for synchronization, and we can even use the tasks list itself. That's what we did here.

We also called the `notifyAll()` method here. If the tasks variable is empty, we have to make the threads wait. That's what we did in the take method. That way, we don't waste the CPU cycle. If tasks get a task again, only then do we wake up the working thread to take it and execute the task. So the `take()` method itself is also synchronized over the tasks variable.

At the bottom of the MyThreadPool, we have a private class that extends thread. In the thread's run method, it keeps taking items from the tasks list in a while loop. This loop runs as long as the running variable is true. Since we have a multithreaded situation here, and this variable might be cached in CPU, that's why we have to make it volatile as well.

That's it. We have got a ThreadPool of our own. One thing to keep in mind is that this is an exercise-only implementation. This `ThreadPool` isn't recommended to use in any way in a production environment. We have a great Executors API in JDK for production, which I will discuss in future articles.

Let's now use our own ThreadPool:

```
package com.bazlur.threads;

public class Playground {
  public static void main(String\[\] args) throws InterruptedException {

    var pool = new MyThreadPool(10);
    for (int i = 0; i < 100; i++) {
      pool.submit(new Runnable() {
        @Override
        public void run() {
          System.out.println("Running inside: " + Thread.currentThread());
        }
      });
    }
  }
}
```

That's all for today!

Don’t Forget to Share This Post!

