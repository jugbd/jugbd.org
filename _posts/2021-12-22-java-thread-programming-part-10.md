---
title: "Java Thread Programming (Part 10)"
author: A N M Bazlur Rahman
date: 2021-12-22T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---

In this article, I will discuss `BlockingQueue`, one of the essential concurrent collections available in the concurrent package in the JDK. In [one of our previous articles](https://foojay.io/today/java-thread-programming-part-6/), we discussed the Producer/Consumer pattern. We will implement the same pattern today using BlockingQueue.

In that implementation, we used a buffer, and when Buffer is full, we put the producer thread in a waiting state. And if Buffer is empty, we put the consumer thread in a waiting state. To coordinate between threads, we had to use, wait(), notify() and notifyAll(), these low-level constructs. However, if we use BlockingQueue, we don't have to use these low-level details. BlockingQueue was implemented with such details built in, so that we can just rely on it. It has two methods that are important in our discussion:

`put()` - this method puts an item in the Queue. If there is no space available in the Queue, it just puts the threads (the one trying to put the value into the Queue) into a dormant state, a waiting state. Once space is available, the threads are then put back into running state.

`take()` - this method takes out an item from the Queue. It does precisely the opposite of the put method. If a thread wants to take an item, but if the Queue is empty, then it puts the thread into a waiting state. When items are available, the thread resumes.

The `BlockingQueue` is an interface, and it has my implementation. They are:

```
java.util.concurrent.ArrayBlockingQueue
java.util.concurrent.DelayQueue
java.util.concurrent.LinkedBlockingQueue
java.util.concurrent.LinkedBlockingDeque
java.util.concurrent.PriorityBlockingQueue
java.util.concurrent.SynchronousQueue
```

Etc.

`BlockingQueue` can be bounded and unbounded:

```
BlockingQueue<Integer> queue = new LinkedBlockingDeque<>();
```

The above Queue is unbounded. Therefore, it usually will not block any thread if we keep putting items. The reason is, it can hold `Integer.MAX_VALUE` items. This is enough for our typical use cases.

We can, however, create a bounded queue using one of its constructors:

```
BlockingQueue<Integer> queue = new LinkedBlockingDeque<>(10);

```

Now it will only be able to hold ten items at a time. If a thread wants to put more items, it will put the thread into a waiting state.

Let's use this `BlockingQueue` and implement our producer/consumer pattern. Previously we wrote a class named Buffer. We will do the same here except using BlockingQueue:

```
package ca.bazlur.playground;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;

public class Buffer {
    private static final int MAX\_SIZE = 10;
    private final BlockingQueue<Integer> queue = new LinkedBlockingDeque<>(MAX\_SIZE);

    public void addItem(int item) {
        try {
            System.out.println(Thread.currentThread() + ": Adding item: " + item);
            queue.put(item);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AssertionError(e);
        }
    }

    public Integer getItem() {
        try {
            System.out.println(Thread.currentThread() + ": Let's consume an item");
            return queue.take();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AssertionError(e);
        }
    }
}
```

This class is now pretty simple, with no locking, no low-level thread constructs.

Let's use it now:

```
package ca.bazlur.playground;

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

That's it for today!

Don’t Forget to Share This Post!

