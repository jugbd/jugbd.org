---
title: "Java Thread Programming (Part 9)"
author: A N M Bazlur Rahman
date: 2021-12-14T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---

**In [our last article](http://bazlur.com/2021/12/java-thread-programming-part-8/), we discussed thread-safety in naive terms and shared a couple of ways to ensure thread safety.** **We also introduced a package containing thread-safe classes, which we can confidently use without worrying much, e.g., AtomicInteger. This is because they are designed in a thread-safe way.**

Today in this article, we will continue the discussion and share a few more thread-safe classes that we can use in our day-to-day coding.

### **Synchronized Collections**

One of the most important data structures that Java provides are collections. We depend on them heavily in our day-to-day coding. Not all collection implementations available in java.util package are thread-safe, but a few of them are:

```
java.util.Vector
java.util.Stack
java.util.HashTable
```

Every method in these classes has synchronized keywords associated with them. Although we can use them in a multi-threaded environment, these classes are no longer recommended to use, as we have better alternatives. However, we will discuss them shortly.

Apart from these classes, we can transform any collections available in java.util package, using the following factory methods available in java.util.Collections:

```
static <T> Collection<T> synchronizedCollection(Collection<T> c); 
static <T> Set<T> synchronizedSet(Set<T> s);
static <T> List<T> synchronizedList(List<T> list); 
static <K,V> Map<K,V> synchronizedMap(Map<K,V> m); 
static <T> SortedSet<T> synchronizedSortedSet(SortedSet<T> s);
static <K,V> SortedMap<K, V> synchronizedSortedMap(SortedMap<K,V> m);
```

These methods return synchronized collections. Example:

```
var ints = new ArrayList<Integer>();
var synchronizedList = Collections.synchronizedList(ints);
```

### **Client-Side Locking**

The synchronizedList instance is thread-safe. However, there is a caveat. Even though these classes are thread-safe, a compound operation on these thread-safe collections is not thread-safe. This could seem a bit puzzling. Not to worry, bear with me.

An example of compound operation could be - while iterating over a collection and then removing elements, perhaps with a condition.

Look at the following code:

```
package ca.bazlur.playground;

import java.util.Vector;

public class ListHelper {
  public static <E> E getLast(Vector<E> list) {
    int lastIndex = list.size() - 1;
    return list.get(lastIndex);
  }

  public static <E> void removeLast(Vector<E> list) {
    int lastIndex = list.size() - 1;
    list.remove(lastIndex);
  }
}
```

In the above class, we have two methods, one gets the last item, and the other removes the last one. So now the question is, what if we call these two methods from two different threads?

In the first method (getLast()) has two statements in it. The first statement finds the size of the vector and then subtracts one from it to find the last index of the last elements. The second statement uses this index to find the last element. What if while executing the first segment in one thread, before returning the element, another thread removes the element? We will certainly get an ArrayIndexOutOfBoundException. The reason is, while the second statement of the first method is trying to access the element, it’s not there anymore; it’s already removed.

Now, if we synchronize these two methods, would that help?

```
import java.util.Vector;

public class ListHelper {
  public synchronized static <E> E getLast(Vector<E> list) {
    int lastIndex = list.size() - 1;
    return list.get(lastIndex);
  }

  public synchronized static <E> void removeLast(Vector<E> list) {
    int lastIndex = list.size() - 1;
    list.remove(lastIndex);
  }
}
```

Even though it sounds like the above code will solve the issue, but it doesn’t. The reason is, when we use synchronized keywords on a static method, it uses the class (ListHelper.class) object as its lock. On the other hand, the vector class is a synchronized class; it has its own lock. That means we are dealing with two different locks here. If these methods are called from two different threads ( A and B), one of them will acquire the lock of the ListHelper class at a point in time.

However, since the Vector class itself has its own lock, other threads ( aside from A and B) can acquire that lock and execute any compound operations. The reason is, the lock of ListHelper isn’t preventing doing so. We can only fix this problem if we can use one lock, and when a thread acquires that lock, no other operation can be done from any other threads on this Vector class.

```
import java.util.Vector;

public class ListHelper {
  public static <E> E getLast(Vector<E> list) {
    synchronized (list) {
      int lastIndex = list.size() - 1;
      return list.get(lastIndex);
    }
  }

  public static <E> void removeLast(Vector<E> list) {
    synchronized (list) {
      int lastIndex = list.size() - 1;
      list.remove(lastIndex);
    }
  }
}
```

The above class exactly does that. It synchronizes over the list object itself. This sort of synchronization is called client-side locking or external locking.

Although I have used the Vector class in the above example, we no longer use Vector in our day-to-day coding. It is considered a legacy collection. In that case, we may be tempted to use our regular collection classes and the factory method to synchronize them, which we introduced earlier. For example:

```
package ca.bazlur.playground;

import java.util.ArrayList;
import java.util.Collections;

public class SynchronizedCollectionDemo {
  public static void main(String\[\] args) {
    var numbers = new ArrayList<Integer>();
    numbers.add(1);
    numbers.add(2);
    numbers.add(3);
    numbers.add(4);
    var synchronizedNumbers = Collections.synchronizedList(numbers);

    synchronized (synchronizedNumbers){
      for (int i = 0; i < synchronizedNumbers.size(); i++) {
        Integer number = synchronizedNumbers.get(i);
        processIt(number);
      }
    }

  }

  private static void processIt(Integer number) {
    //TODO we process the number here
  }
}
```

There is another standard way to iterate over a collection.

```
for (Integer number : synchronizedNumbers) {
  processIt(number);
}
```

However, this iteration doesn’t avert the need for client-side locking if other threads can modify the collection. This is because the iteration returned by synchronized collections are not designed to deal with concurrent modification; rather, a fail-first approach was taken. If they detect that collection was changed after the iteration began, it throws the unchecked ConcurrentModificationException.

### **Concurrent Collections**

Although client-side locking solves our issue discussed above, it has some downside as well. If a collection is extensive, it may take a while to iterate. While it’s being iterated, no other operation can be performed, which would certainly hurt the overall performance of the applications. To deal with this issue, in java 5.0, a few classes are added to the concurrent packages. These are:

```
java.util.concurrent.ConcurrentLinkedQueue
java.util.concurrent.ConcurrentLinkedDeque
java.util.concurrent.ConcurrentSkipListSet
java.util.concurrent.ConcurrentHashMap
java.util.concurrent.ConcurrentSkipListMap
java.util.concurrent.ConcurrentNavigableMap
java.util.concurrent.CopyOnWriteArraySet
java.util.concurrent.CopyOnWriteArrayList
java.util.concurrent.ArrayBlockingQueue
```

We don’t need to use client-side locking in the above classes. These are thread-safe, optimized, and highly performant classes. Ideally, in our modern code, we will use these classes in our day-to-day coding rather than the technique discussed in this article.

That’s all for today!

Don’t Forget to Share This Post!

