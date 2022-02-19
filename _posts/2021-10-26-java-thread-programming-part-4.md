---
title: "Java Thread Programming (Part 4)"
author: A N M Bazlur Rahman
date: 2021-10-26T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---
This article was first published in [Foojay.io](https://foojay.io/today/java-thread-programming-part-4/)

In [the previous article](https://bazlur.com/2021/10/java-thread-programming-part-3/), we discussed the visibility problem while working with multiple threads.

We will discuss another similar situation in this article. However, we will use symbols and pseudocode to explain this.

Symbols
-------

Let’s define the symbols first.

*   `L` - Local variable, e.g., `L1`, `L2`, etc.
*   `S` - Shared variable, e.g., `S1`, `S2`, etc. These variables are visible among multiple threads. They can be static as well.

`S.X` - here `X` is a field of an object where `S` is the reference of that Object, e.g., `S1.X`.

In pseudocode, we will use thread number and line number as well. For example, `1.1`, here, `1` is the thread id, and the number after the dot is the line number.

`1.2` - thread `1`, line number `2`.

The local variables will have defaults unless they are initialized with a value. For example, for `Boolean`, the default value is `false`; for `integer`, the default value is `0`.

Pseudocode
----------

If we turn the program that we discussed [in the last article](https://foojay.io/?p=50525&preview_id=50525&preview_nonce=2c6db1d17c&preview=true) into symbols and pseudocode, we have the following:

|Thread 1|  Thread 2|
|------|------------|
|1.1 WHILE (!S1){}|  2.1 S1= TRUE|
|1.2 PRINT “Foojay.io” | 2.2 PRINT “I love ”|

Since we already discussed the above problem in our previous article, the execution order would be:

```text
Execution order 1 # 1.1, 2.1, 1.2, 2.2
Execution order 2 # 1.1, 2.1, 2.2, 1.2
Execution order 3 # 1.1, 2.1, 2.2
```

Now that we are familiar with the symbol and pseudocode let’s see another problem:

|Thread 1| Thread 2|
|-------|----------|
|1.1 L1 = S1| 2.1 L2 = S2|
|1.2 S2 = 2| 2.2 S1 = 1|
|1.3 PRINT “Thread1: ” + L1|2.3 PRINT “Thread2: ”+ L2|

What can be the possible output of this program?

The possible execution order could be:
```text
Execution order 1 # 1.1, 1.2. 1.3, 2.1, 2.2, 2.3
Execution order 2 # 2.1, 2.2, 2.3, 1.1, 1.2. 1.3
```

If the first execution order succeeds, then the output would be:

```text
Thread1: 0
Thread2: 2
```
And if the second execution order succeeds, then the output would be:

```text
Thread1: 0
Thread2: 1
```

However, apart from the above two, there is another possible execution order:

```text
Execution order 3:  1.1, 2.1, 1.2, 2.2, 1.3, 2.3
```

If the above execution order succeeds, then the output would be:

```text
Thread1: 0
Thread2: 0
```

The above output doesn’t depend on the last two executions, `1.3`. or `2.3`.

So the output will remain the same if though `2.3` executes first.

Execution Order Optimization
----------------------------

So far, we have three execution orders, and it seems only the three outputs mentioned above are possible.

However, in reality, we can have the following output as well:

```text
Thread1: 1
Thread2: 1
```
...or...
```text
Thread1: 2
Thread2: 2
```

These outputs may not seem logical, however, they are possible. And the execution order could be:

```text
Execution order 4: 2.1, 1.1, 1.2, 2.1, 1.3, 2.3
```
...or...

```text
Execution order 5: 1.2, 2.1,2.2, 1.1, 1.3, 2.3
```

Now the question is how this is even possible?

The answer is that we write our code in a particular order; however, when executing it, it doesn’t mean the Java compiler and virtual machine maintain that order. The **Java compiler may change the execution order to optimize it if it can determine that the output won’t change in single-threaded code**. For example, just look at the order of the code in the first thread. If we interchange the execution order, `1.1` and `1.2`, the output won’t change in that thread.

These sorts of changes happen for various reasons. For example, the intelligent algorithm of the Java compiler may find a way to optimize particular code to run faster. The bottom line is, the program order and execution order may vary. It doesn’t always match. And the execution order also depends on the computer, hardware architecture, etc. So this is a possible source of having a programming bug. This sort of bug may not be easily detectable in a development environment but can very likely appear in a production environment. However, when you go to find it, it may disappear. This sort of bug has a unique name; they are called [Heisenbugs](https://en.wikipedia.org/wiki/Heisenbug).

Let’s look at another example:

|Thread 1 | Thread 2|
|---------|---------|
|1.1 L1 = S1 |    2.1 L6 = S1|
|1.2 L2 = L1.X |  2.2 L6.X = 3|
|1.3 L3 = S2  |   2.3 PRINT “Thread2: ” + L6.X|
|1.4 L4 = L3.X||
|1.5 L5 = L1.X||
|1.6 PRINT “Thread1: ” + L2, L4, L5||


In this program, we have used an object which has a field `X`.

Here, `S1` and `S2` are the references of the same Object.

If the second thread runs first, what would be the output of thread 2?

```text
Thread2: 3
```

The reason is, in `2.3` we have set `L6.X = 3`. However, if execution order is different than the program order, the output would be different. That’s why here the Java compiler won’t change it.

Now let’s look at the first thread. What would be the output?

```text
Thread1: 000
```

In this case, `1.2`, `1.4`, and `1.5` must have run before `2.2`. if `2.2` executes first, then the output would be:

```text
Thread1: 333
```

If `1.2` execute before `2.2` and then `1.4` and 1.5 execute, the output would be:

```text
Thread1: 033
```

If `1.2` and `1.4` executes before `2.2` and then `1.5` executes, the output would be:

```text
Thread1: 003
```

Now, look at the following output:

```text
Thread1: 030
```

Do you think the above output is possible? The reason is if `1.2` executes first and then `2.2` executes, and then it doesn’t matter whatever the execution order for the rest of the exception, the output should be:

```text
Thread1: 033
```

And we know `S1` and `S2` refer to the same Object.

This is only possible if the compiler changes the program order while compiling.

Note that, line `1.2` and `1.5` assign the same value. And `L2` and `L5` are just used to print the value.

To optimize the above code, the compiler can remove the `L5` altogether. Instead of `L5`, it can use`L2`. In a single-threaded environment, this change won’t reflect the output. In our code, although we have used `L2`, `L4`, and `L5` to print the value, the compiler can print `L2`, `L4`, and `L2` again.

In such a case, if `1.2` executes first and then `2.2`, since the compiler removed `L5`, instead of in the print statement, it will print the value of `L2` in place of `L5`, which was assigned in line `1.2`.

The above example can be found in [the Java language specification](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html).

From the above discussion, we have understood that the execution order can be different to the program order. The execution order depends on the compiler’s optimization technique; it can further rely on the Java virtual machine and the CPU itself. Thus the output of a program becomes uncertain. In a multithread environment, we call this a **data race**.

Benefits and Drawbacks of Volatility
------------------------------------

Now the question is, what can be the solution to this problem. Well, the solution is relatively straightforward: [we simply use the keyword "volatile"](https://bazlur.com/2021/10/java-thread-programming-part-3/).

This keyword can only be used in the field of an Object, not in a local variable. This is because we don’t share local variables. Also, if a field is final, we don’t need to use volatile in it. This is because the final fields never get to change, and thus, they don’t create any problems either.

We have to keep in mind that if a reference to an Object is used as a field and we then make it volatile, that doesn’t mean the content of the Object is also volatile. The reference is the only thing that is volatile in this case.

The benefits of using the volatile keyword are:

*   The thread always reads from the main memory. The CPU will never cache the value in its cache. So the visibility problem will disappear.
*   Besides that, if we use volatile on a variable, the compiler is instructed that this value can be changed any time and shared among multiple threads, so therefore it is instructed not to optimize it. The compiler adds a kind of memory fence or barrier that instructs the CPU not to optimize. And this prevents the data race issue.

Although the volatile keyword may be a solution, using it too much may cause problems. Since it prevents the CPU from caching data, that certainly reduces the performance of a program a bit. Besides, it prevents further optimization.

Therefore, we need to be very careful when using the "volatile" keyword, and we should use it only where it’s required, and definitely not everywhere.

That’s all for today!
