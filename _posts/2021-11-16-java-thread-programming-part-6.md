---
title: "Java Thread Programming (Part 6)"
author: A N M Bazlur Rahman
date: 2021-11-16T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---
> Have you ever wondered what is the purpose of the "wait()", "notify()", "notifyAll()" methods that come with each Java object? Well, this article will explain that!

In [the previous article](https://bazlur.com/2021/11/java-thread-programming-part-5/), we learned how to use shared variables in a multi-threaded context and ensure thread safety avoiding data race and race conditions. However, in programming, sometimes multiple threads require to coordinate with each other by sending signals. For example -

*   For a thread, it's not yet their turn to start work; rather it's waiting for a signal to start.
*   A thread is working, but to complete its work, it needs more data; it can send a signal to the Producer to produce more data.
*   Another thread that are producing data can signal other thread that data is ready.

Basically, there are many similar cases when we need to coordinate among multiple threads. Let's discuss this in this article.

Let's start with an example:

Assume a thread is waiting to count the vote in a Polling station (Ideally, it's a service, just assume a real one for the sake of example). This thread will start counting votes when all votes are completed. The code could look like this:

```java
while (true) {
  synchronized (lock) {
    if (votingComplete) {
      countVotes();
      break;
    } else {
      // do nothing...simply wait here.
    }
  }
}
```

The above code looks just fine; it doesn't seem to have any problem; it will produce the correct result. When the `Boolean` variable `votingComplete` becomes `true`, the voting count will start; otherwise, the thread that runs this piece of code will stay there and do nothing. The only problem is, we are running it under a while loop. This is essentially doing nothing but eating up the CPU cycle. This sort of situation is sometimes called busy waiting.

We can prevent this from happening. The thread can stay waiting without wasting CPU cycles. To understand that, we have to know a little about the thread's life cycle. Let's learn about it.

By now, we know that if a computer has one CPU, it can run only one thread at a point in time. If we have 8 CPUs in a computer, it will be able to run 8 threads at a point in time. Multiple threads are scheduled to be run one after one. How they are prioritized is highly depends on the scheduling algorithm that the operating system provides.

For example, if the scheduling algorithm is round-robin, then a thread gets a small window to run their code, and then context switch occurs, another thread gets a similar amount of time. If a thread can't finish their work with the window, the current state of the threads are stored in the memory, and when it gets its chance again, it restores the store and starts again.

Each thread can have a priority between 1 to 10. 1 means minimum priority, and 10 is the maximum priority. Usually, all threads in java start with the normal priority, which is given 5 by default unless specified. Some thread schedulers sometimes take account of this priority, and some don't. It really depends on OS.

So the takeaway is, a thread goes through a multiple-stage of its life.

*   **New state**: Each thread starts with a new state when we create its instance. It remains in this state until we call it the start method.
*   **Runnable state**: When we call the start method of an instance of thread, it goes to the runnable state. At this point, the control of the thread goes to the threads scheduler. The thread scheduler then decides when this thread going to execute its code. Usually, thread scheduler gives a small window to run a thread, which is called quantum or time slice. When the thread executes its code, then it's called running state. When it gets from runnable to running state, it depends on the operating system. The java virtual machine mainly relies on the host operating system. That's why JVM cannot be different between these two states. That's why we combine these two-state and call them a runnable state.
*   **Blocked state**: In many cases, a thread cannot complete its work within the time slice given to it. For example- it may require I/O. Then OS usually blocks this thread for a while. The other example is that a thread is working on a critical section, but the other thread wants to go into it; since the lock is already occupied, it cannot reach that. When this happens, this state of the thread is called a blocked state. Then, when the I/O is done or gets the chance to acquire the lock of that critical section, it goes to the runnable state again.
*   **Waiting state**: Sometimes, we want to keep a thread stopped for a while. For example, we want a thread to start after the other one finishes it works. We can do this using the wait method of the lock object. The thread goes to the runnable state once the condition is met.
*   **Timed waiting state**: this is the same as the waiting state, only it waits for a given period. And then it goes to runnel state again. Usually, when put a thread in sleep, it goes to the timed waiting state. However, there is a difference between sleep and waiting. In the sleeping state, the thread doesn't release the lock but the waiting state does. We can discuss this sort of difference later.
*   **Terminated state**: When a thread is done with its work, mainly work leaves from the run method, the thread goes to the terminated state.

![](https://foojay.io/wp-content/uploads/2021/11/thread-lifecycle-700x379.png)

Now that we know the lifecycle of a thread, we can put a thread into a waiting state. In java, any object can be used as a lock, and each object has a wait method associated with it.

In a synchronized block, if we call this wait method, the thread executing the code will go into a waiting state. The head will remain in this state until a signal is passed to it.

```java
synchronized (lock) {
  while (!votingComplete) {
    lock.wait();
  }
  countVotes();
}
```

We can send a signal to a thread using two methods of the lock object:

````java
notify()
notifyAll();
````

If we have only one thread in a waiting state, then we can call notify() method, and if we have multiple threads waiting, then we call notifyAll();

```java
synchronized (lock) {
  votingComplete = true;
  lock.notify();
}
```

We have to keep two things in mind while using `wait()` & `notify()`:

*   This `wait()`, `notify()`, `notifyAll()` method can be called only inside a synchronized block. If we call them outside synchronized block, then Weill gets IllagalMontorStateException.
*   When we call the wait() motioned based on a condition, we must call it inside a loop. The reason is that the thread does not necessarily wake up due to notify signals. There might be some other reasons, and the condition is not yet met. This is called spurious wakeups. If the condition is not met yet, we should put the thread again in the waiting state.

```java
while (!conditionMet){
  lock.wait();
}
```

Let's see a class example called producer-consumer.

The idea is one thread will produce data from input. We call it Producer. It can only produce a limited amount of data, and then it puts into a buffer. The buffer is a shared data structure between threads. The other threads can consume the data from the buffer. They are called consumers. Initially, the buffer is empty, and the Producer can only produce as long as the buffer isn't full. On the other hand, the Consumer can take data as long the buffer isn't empty.

```java
package com.bazlur;

import java.util.LinkedList;
import java.util.Queue;

public class Buffer {
private static final int MAX\_SIZE = 10;
private final Queue<Integer> queue = new LinkedList<>();
private final Object lock = new Object();

    public void addItem(int item) {
        synchronized (lock) {
            while (queue.size() == MAX\_SIZE) {
                System.out.println(Thread.currentThread() + ": Buffer is full, let's wait");
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            System.out.println(Thread.currentThread() + ": Resumed!");
            System.out.println(Thread.currentThread() + ": Adding item: " + item);

            queue.add(item);
            System.out.println(Thread.currentThread() + ": Item has been added, let's notify all consumers");
            lock.notifyAll();

        }
    }

    public Integer getItem() {
        synchronized (lock) {
            while (queue.isEmpty()) {
                System.out.println(Thread.currentThread() + ": Buffer is empty, let's wait");

                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            System.out.println(Thread.currentThread() + ": Resumed.");
            System.out.println(Thread.currentThread() + ": Let's consume an item");
            Integer item = queue.poll();

            lock.notifyAll();

            return item;
        }
    }
}
```
In the above program, we have used a `queue` for integers. For simplicity, let's assume this queue can hold 10 sizes. In the `addItem()` method, when the queue size becomes 10, we call the `wait()` from the lock; as a result, the thread that is executing this `addItem()` method will go into a waiting state.

On the other hand, when `getItem()` is called from the consume thread, an item gets consumed from the queue. So in the queue, a space becomes free. So now the Producer can add a new item to it. But since the Producer is in a waiting state, we have to notify them by using `notifyAll()`.

Similarly, when the queue is empty, the consumer thread must be waiting until we get some data is produced in the buffer. That's why in the getItem method if the queue is empty, we put that thread in the waiting state.

Let's use it in code:

```java

package com.bazlur;

import java.util.Random;

public class ProducerConsumerExample {
static final Random random = new Random();

    public static void main(String\[\] args) throws InterruptedException {
        var buffer = new Buffer();

        var producer1 = new Thread(() -> {
            while (true) {
                buffer.addItem(getRandomItem());
            }
        });
        producer1.setName("Producer # 1");

        var producer2 = new Thread(() -> {
            while (true) {
                buffer.addItem(getRandomItem());
            }
        });
        producer2.setName("Producer # 2");

        var consumer1 = new Thread(() -> {
            while (true) {
                buffer.getItem();
            }
        });
        consumer1.setName("Consumer # 1");

        var consumer2 = new Thread(() -> {
            while (true) {
                buffer.getItem();
            }
        });

        consumer2.setName("Consumer # 2");

        producer1.start();
        producer2.start();

        consumer1.start();
        consumer2.start();
    }

    private static int getRandomItem() {
        return random.nextInt();
    }
}
```


Sample output:

```text
Thread\[Producer # 2,5,main\]: Adding item: 547252719
Thread\[Producer # 2,5,main\]: Item has been added, let's notify all consumers
Thread\[Producer # 2,5,main\]: Resumed!
Thread\[Producer # 2,5,main\]: Adding item: 951373866
Thread\[Producer # 2,5,main\]: Item has been added, let's notify all consumers
Thread\[Producer # 2,5,main\]: Resumed!
Thread\[Producer # 2,5,main\]: Adding item: -1764357796
Thread\[Producer # 2,5,main\]: Item has been added, let's notify all consumers
Thread\[Producer # 2,5,main\]: Buffer is full, let's wait
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Producer # 1,5,main\]: Resumed!
Thread\[Producer # 1,5,main\]: Adding item: 1395127827
Thread\[Producer # 1,5,main\]: Item has been added, let's notify all consumers
Thread\[Producer # 1,5,main\]: Buffer is full, let's wait
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Resumed.
Thread\[Consumer # 1,5,main\]: Let's consume an item
Thread\[Consumer # 1,5,main\]: Buffer is empty, let's wait
Thread\[Producer # 2,5,main\]: Resumed!
Thread\[Producer # 2,5,main\]: Adding item: 895456426
Thread\[Producer # 2,5,main\]: Item has been added, let's notify all consumers
Thread\[Producer # 2,5,main\]: Resumed!
Thread\[Producer # 2,5,main\]: Adding item: 1165192158
Thread\[Producer # 2,5,main\]: Item has been added, let's notify all consumers
Thread\[Producer # 2,5,main\]: Resumed!
Thread\[Producer # 2,5,main\]: Adding item: -2019336704
Thread\[Producer # 2,5,main\]: Item has been added, let's notify all consumers
Thread\[Consumer # 2,5,main\]: Resumed.
Thread\[Consumer # 2,5,main\]: Let's consume an item
Thread\[Consumer # 2,5,main\]: Resumed.
Thread\[Consumer # 2,5,main\]: Let's consume an item
Thread\[Consumer # 2,5,main\]: Resumed.
.....
.....
......
```

That's all for today!

Don’t Forget to Share This Post!
