---
title: How the java code gets executed and performs better?
author: A N M Bazlur Rahman
date: 2014-09-22 04:00:00 +0000
categories:
- Java
comments: false
tags:
- Execution
- 'Compilation '
- JIT
- 'Performance '
- Java
image: assets/media/mike-kenneally-zlwdjoktua8-unsplash.jpg

---
Please bear with my attempt to inform you a little regarding the execution of Java code.  
  
Java’s code is compiled into byte code, which Java’s virtual machine executes. This output is an intermediate language (IL) that is neither human-readable nor machine-executable. Only the virtual machine understands it. To execute this output, the virtual machine uses a Just in Time (JIT) compiler to interpret the byte code – so is Java an interpreted language as some people describe it, or is Java a compiled language? The answer: Java is both. Its source code is compiled with a static compiler into byte code – and then, the JIT interprets the compiler’s output.  
  
From the previous description, one might be tempted to conclude that the JIT hurts performance, as it compiles during execution, a design that would seem to cause Java to run slowly. This conclusion, while intuitive, is incorrect. The JIT actually performs quite well. At run time, it compiles byte code into machine code, which is later run by the **CPU**. When Java executes, it executes machine code just as native code does – so it should run – discounting the JIT’s compilation costs – as fast as native code does.  
  
However, C/C++ is generally regarded as providing better performance than Java does. The on-the-fly nature of Java’s execution lends credence to this thinking. Compiling a piece of code into machine code takes a non-trivial amount of time. If a language executes similar machine instructions but does not need compilation prior to the execution of them, then one can assume that the language in question runs faster than Java does – even when Java’s machine code output is maximally optimized. However, Java isn’t maximally optimized, but C++ is not maximally optimized either. No compiler can match the performance of a top-notch assembly programmer who is an expert at manipulating the targeted hardware – so both Java and C++ can never be maximally optimized. Making matters worse, both languages have inherent issues. Java must bear the reality that at least some of its code has to be compiled every time that it runs, and C++ is, when it must be generic, often not fully tailored to its hardware, as Java always is. Even with the aforementioned handicap, one still expects Java’s compilation cost to give C++ an edge in every scenario outside of very poorly coded or compiled C++.  
  
However, appearances are deceiving; the JVM is a very intelligent environment, and the JIT an intelligence compiler. For example, the JVM knows which methods are called frequently, as it maintains a count of each method’s calls. When this count exceeds a certain threshold, the method’s machine code is kept, so that the JIT does not have to compile the method when it is called again – a decision that greatly reduces the cost of translating byte code into machine code. Furthering this performance improvement, the JIT optimizes the most frequently used code. The JIT collects statistics to determine which parts of code fit this mold. Intelligent optimization of this ilk can, as Research indicates, yield big gains. Most research states that 80% of execution time is spent executing 20% of the code (“hot code”) – so optimizing these sections of code can yield sizeable performance benefits. The JIT optimizes “hot code.” It executes these sections in a highly optimized way directly on the operating system. To achieve this goal, the JIT uses statistics to identify the “hot code.” In fact, Java performs even more optimization than efficiently executing “hot code.” It identifies the code that it executes the most and recompiles to run more efficiently than it previously did. These optimizations allow Java to achieve, in certain situations, better performance than C++ gives, without the need to resort to dangerous compiler settings or too dangerous optimization techniques.