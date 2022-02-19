---
title: "Java Thread Programming (Part 2)"
author: A N M Bazlur Rahman
date: 2021-10-12T06:42:00-04:00
type: post
tags: [java, coding, Thread, Concurrency]
categories: [java, concurrency, Thread Programming, Thread]

---
This article was first published in [Foojay.io](https://foojay.io/today/java-thread-programming-part-2/)

In [our earlier article](https://bazlur.com/2021/10/java-thread-programming-part-1/), we explained the background to threading and how to create and start a thread.

In this article, let's see an example where we can use Threads to our benefit.

Let's assume we are going to build a web server. For the sake of the example, let's constrain ourselves to one single use case, which is that the web server will listen to any client, and if it receives a URL, it will return the top five most frequently used words in that website.

OK, enough talk, let's see the code!

```java
package com.bazlur;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.util.stream.Collectors;

public class SingleThreadedServer {
  private final MostFrequentWordService mostFrequentWordService = new MostFrequentWordService();

  public SingleThreadedServer(int port) throws IOException {
    var serverSocket = new ServerSocket(port);
    while (true) {
      var socket = serverSocket.accept();
      handle(socket);
    }
  }

  private void handle(Socket socket) {
    System.out.println("Client connected: " + socket);

    try (var in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
         var out = new PrintWriter(socket.getOutputStream(), true)) {
      String line;

      while ((line = in.readLine()) != null) {
        if (isValid(line)) {
          var wordCount = mostFrequentWordService.mostFrequentWord(line)
                  .stream()
                  .map(counter -> counter.word() + ": " + counter.count())
                  .collect(Collectors.joining("\n"));
          out.println(wordCount);
        } else if (line.contains("quit")) {
          out.println("Goodbye!");
          socket.close();
        } else {
          out.println("Malformed URL");
        }
      }
    } catch (IOException e) {
      System.out.println("Was unable to establish or communicate with client socket:" + e.getMessage());
    }
  }

  private static boolean isValid(String stringURL) {
    try {
      new URL(stringURL);
    } catch (MalformedURLException e) {
      System.out.println("invalid url: " + stringURL);
      return false;
    }
    return true;
  }

  public static void main(String[] args) throws IOException {
    new SingleThreadedServer(2222);
  }
}
```

Let's walk through the code first. In the above code, a `ServerSocket` starts at a port and waits in a loop for the clients to connect. The `handle()` method is the most important one. It gets a Socket object and then talks to the client. If a client sends a valid URL, It calls a service, `MostFrequentWordService`, to get the most frequent words.

We can use telnet to connect the server and use this server.

![](/img/single-threaded-server.png)

The only problem with this is it can handle only one client at a time. So if we try to connect another client, it will respond only when the other connected client gets disconnected.

That's certainly a problem for a web server. A web server is supposed to connect with hundreds or thousands of clients simultaneously.

We can solve this problem quite quickly, if we turn this single-threaded program into a multi-threaded program. Recall the `handle()` method from the above code. Whenever a client connects, I can spawn a new thread and hand over the `handle()` method to that Thread:

Yes, that's the trick. Let's do it:

```java
public class MultiThreadedServer {
  private final MostFrequentWordService mostFrequentWordService = new MostFrequentWordService();

  public MultiThreadedServer(int port) throws IOException {
    var serverSocket = new ServerSocket(port);
    while (true) {
      var socket = serverSocket.accept();

      var thread = new Thread(() -> handle(socket));
      thread.start();
    }
  }

  //rest of the code. 
}
```

Now, we can connect multiple clients at once, and serve them all simultaneously:

![](/img/multiple-client.png)

Now that we understand the benefits of using threads in Java, we will dig a bit deeper into using threads in the following articles in this series.

And in case you are interested in how I wrote the "MostFrequentWordService", here it is:

```java
package com.bazlur;

import org.jsoup.Jsoup;

import java.io.IOException;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

record WordCount(String word, long count) {
}

public class MostFrequentWordService {
  public List mostFrequentWord(String url) throws IOException {
    var wordCount = Arrays.stream(getWords(url))
            .filter(value -> !value.isEmpty())
            .filter(value -> value.length() > 3)
            .map(String::toLowerCase)
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

    return wordCount.entrySet()
            .stream()
            .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
            .limit(5)
            .map(entry -> new WordCount(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
  }

  private String[] getWords(String url) throws IOException {
    var connect = Jsoup.connect(url);
    var document = connect.get();
    var content = document.body().text();

    return content.split("[^a-zA-Z]");
  }
}
```

That's it for today!

Don’t Forget to Share This Post!

