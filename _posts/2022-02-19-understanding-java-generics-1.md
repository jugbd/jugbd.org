---
title: All about Generics: Part 1
author: Syed Mainul Hasan
date: 2022-02-19 01:45:00 +0000
type: post
categories: [Tutorial, Java]
tags: [Java, JUGBD, JUG, Generics]
comments: true
---

## Benifits of Generics

### Type safety

Using generics with helps us define a type to consume in and produce from, where it is used. Which means, we can be sure of
adding a specific type of data in a Collection type for example (`List<Integer>`), and get the exact same type. This saves us from getting
`ClassCastException` and saves us from lots of development pain.

### Type erasure

Type erasure means, all the additional information included while using Java Generics, are removed from bytecode while generated.
In bytecode it will be old java syntax prior to Java 5.

## Where we can use Generics

1. Using Generics with wildcards
   * Unbounded wildcards
   * Bounded wildcards
     * Upper bounded wildcards
     * Lower bounded wildcards
2. Arrays with Generic types
3. Using Generic types as parameter of a class or an interface.
4. Using Generic types with method or constructor definition.

## Components of Generics

1. `<>` - Diamond operator - we put a generic type inside it.
2. `T` - known as a Generic type. We can actually use any character or word instead of T here. usually used as `<T>`
3. `?` - known as wildcard. We use it like `<?>`
4. ``exctnds`` - Used to set Upper Bound of Generic type. Which means, we can not use any parent class of this upper bounded class.
5. ``super`` - Used to set Lower Bound of Generic type. We cannot use any child class of this lower bounded class.

Let's start our today's discussion to explain using Generics with wildcards.

### Using Generics with wildcards

We have talked about wildcard above. Wildcard represents an unknown type. The followings are the examples of wildcard parameterized types.

```

Collection<?>
List<? extends Number>
Comparator<? super String> 

```

Wildcard can be used in the following situations:

* To define the type for a generic containing parameter

```

void addAll(List<? extends Object> objects) {}

```

* To define the type for a generic containing field or local variable

```

Set<? extends Number> numList = Set.of(3, 100_000_000_000_000L, 2.5F, 2.7);

```

* To define unknown type for a generic containing return type. But it is better to make the type specific.

```

ResponseEntity<?> getAll() {
    ..................
    ..................
}

```