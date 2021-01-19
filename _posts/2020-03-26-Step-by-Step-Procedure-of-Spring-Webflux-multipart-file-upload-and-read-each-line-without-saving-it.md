---
title: Step-by-Step Procedure of Spring Webflux multipart file upload and read each line without saving it
author: Eaiman Shoshi
date: 2020-03-26 00:00:00 +0000
categories: [Java, Tutorial, Spring, Webflux]
tags: [Java, Tutorial, Spring, Webflux]
comments: true
image: /assets/media/spring-webflux.jpg
---
I’ve been working on spring webflux for a while. And in my experience, uploading and reading files in this framework is quite a hassle.
<br /><br />
Today I am going to tell about uploading a file using spring webflux. And the most amazing part is that I am not going to save the file but will read it. I will also be going to check whether all the data of the file match my regex criteria or not using powerful Java stream API.
<br /><br />
**The real-life problem description I’ve faced:**
<br />
Have to upload any type of file but the condition is lines of the file have to be separated by a new line. There is no way you can save the file on the server. Create a list of String by reading the file, where each item of the list will be a single line of the file. Each item must have to match a validation rule otherwise, discard the whole file as it is corrupted. So, the summary is: `upload -> read -> check -> list of string` from the file without saving it.<br /><br />
So, the rough steps are:
* Controller to consume the multipart file into Flux FilePart
* Converting the file parts into Flux of String using dataBuffer
* Collect all the data parts string and process them
* Check validity using Java Stream API and regex
* And tons of magic

Sounds scary? Well, I will explain to you step by step. So, what are we waiting for? Let’s dig in.
***
##1. Controller
<script src="https://gist.github.com/eaiman-shoshi/6414a06db982e4d26adb1de51feff2cf.js"></script>

This part is easy. This is a post endpoint that is able to accept multiple files. URL part is `upload-flux` and must have to use `consumes = MediaType.MULTIPART_FORM_DATA_VALUE`. As we can see I have used:
``` java
... upload(@RequestPart("files") Flux<FilePart> filePartFux) 
```

Here, part of the request `files` will be automatically injected as `Flux<FilePart>` into the method by spring webflux.

> N.B: Remember that,
> 1. To upload multiple file you must have to use `Flux<FilePart>`.
> 2. To upload single file you have to use `Mono<FilePart>` or `FilePart`.
> 3. `Mono<MultiValueMap<String, Part>>` can be used for both case. But in that case you have to find out the `FilePart(s)` from the map by key.l Like for this tutorial the key is `files` for both single and multiple file.
> 
> _For this tutorial I am going to use Flux<FilePart>_

##2. Service
From the controller layer, `filePartFlux` is now passed to the service layer. I have divided the work of this service into two methods. Let’s try to understand these methods one by one.

**i. First method:**

<script src="https://gist.github.com/eaiman-shoshi/a2122cf37624a1d2961f79551ebb86a0.js"></script>

In this method the `filePartFlux` is directly passed from the controller layer. Then we flatmap `filePartFlux` and get a new `Flux<String>` stream.
```java
filePartFlux.flatMap(filePart ->
    filePart.content().map(dataBuffer -> {
        byte[] bytes = new byte[dataBuffer.readableByteCount()];
        dataBuffer.read(bytes);
        DataBufferUtils.release(dataBuffer);

        return new String(bytes, StandardCharsets.UTF_8);
    }))
```
`filePartFlux` will emit `filepart` into the `flatmap`. Then we access the `content` of `filepart` and `map` to create a Flux of String. Inside the map, we get `dataBuffer` which is emitted from the `content()`. Here we have to keep in mind that a certain amount of bytes are readable from this `dataBuffer`. So, we take a byte array variable `bytes` with length of `dataBuffer.readableByteCount()`

Then we fill the `bytes` array by reading data from dataBuffer like `dataBuffer.read(bytes)`. Then we free the dataBuffer by releasing it like `DataBufferUtils.release(dataBuffer)`. Then we convert the `bytes` into String and return it. So, when this full process will be completed we will get a new `Flux<String>` stream. Now let's see the rest of the method.
```java
.map(this::processAndGetLinesAsList)
.flatMapIterable(Function.identity());
```
Now, we get every String from the `Flux<String>` stream and by processing them via `processAndGetLinesAsList` method we generate another `Flux<String>` stream from `flatMapIterable(Function.identity())`. `processAndGetLinesAsList` method is described in the next section. For processing and validation check we need another method. After validation check, if the file is corrupted then an empty `Flux<String>` will be returned from here.
<br /><br />
**ii. Second Method:**

<script src="https://gist.github.com/eaiman-shoshi/4cca92f5d5861baa23362aa175a56e07.js"></script>

This not so scary as it looks like. Just read and translate as it is written here.

In this method, we have added some validation over our data. To do that at first we have to split each `string` like `string::lines`

At this point, you might ask why we are doing this? Well, we need every line from the file. But, you know what, as we are getting this `string` variable’s value from `FilePart & DataBuffer`, it is not guaranteed that every `lines` variable from the Flux stream will be a single line from the file. Because we have generated this list from `FilePart & dataBuffer`, so each `string` will contain multiple lines from the file as the file is read part by part and the strings are generated from each part respectively.

So, what we have done here is, we have created a Supplier that will supply a Stream of string. In the Lambda function, we have made a stream from the splitted `string`.

The next statement is our validation checkpoint. Here we are checking every string of the stream (eventually that means every line of the uploaded file) against our REGEX rules using java’s stream API.
```java
streamSupplier.get().allMatch(line -> line.matches(Util.YOUR_REGEX))
```
In short form, this is equivalent to:
```java
stream.allMatch(value -> condition)
```
And this will return `true` only if all the value of the stream meets the condition successfully. What a fantabulous magic it is. Bind blowing, isn’t it?

So, in our code, if all is well, then the stream will be converted into a list and returned. Otherwise, that means the file’s value(s) is/are against our rules, in other words, it is a corrupted file. And thus empty list will be returned.

And that’s it, the Flux of String is returned all the way through to the client. Enjoy the List of String. Phewww, I think we can take a break and have a drink now. Oh, man.
***
> Please share and leave a comment for any questions or feedback.
To see the full tutorial in action with much more ingredients, browse the project on GitHub:
https://github.com/eaiman-shoshi/MultipartFileUpload


> Original link of the post: [Medium blog post](https://medium.com/@eaimanshoshi/step-by-step-procedure-of-spring-webflux-multipart-file-upload-and-read-each-line-without-saving-it-6a12be64f6ee)