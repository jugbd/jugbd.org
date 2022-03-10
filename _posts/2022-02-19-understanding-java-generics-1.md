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

#### Unbounded wildcard parameterized type

A generic type that does not contain any boundary of upper or lower limit, only contains wildcard as type.

```

ArrayList<?>  list = new ArrayList<Long>();  
//or
ArrayList<?>  list = new ArrayList<String>();  
//or
ArrayList<?>  list = new ArrayList<Employee>(); 

```

#### Bounded wildcard parameterized type

Bounded wildcard have 2 types - upper bounded and lower bounded.
These bounds put some restrictions of range of classes that can be used as generic types.
We usually achieve the upper bound limit by `extends` and lower bound limit by `super` keyword.

##### Upper bounded wildcard

Let's assume, we have a method, that takes a parameter of List. The list items can have different instances
of a class, that has multiple child class. Now, we don't know, at which point of time which child class instance
will be added in the list. In such case, we can simply set the upper bounded wildcard.

```

List<Integer> ints = Arrays.asList(1,2,3,4,5);
System.out.println(sum(ints));
      
---------------------------------------------------

private static Number sum (List<? extends Number> numbers){
  double s = 0.0;
  for (Number n : numbers)
     s += n.doubleValue();
  return s;
}

```

##### Lower bounded wildcard

When we want to set a lower limit of a class hierarchy, and we don't want to add any instance of any class below to that
hierarchy, we use `super` keyword to make this lower bounded wildcard.

To demonstrate, let us create 3 classes - Fruit, Apple and AsianApple

```

class Fruit {
    @Override
    public String toString() {
        return "Any fruit!!";
    }
}

class Apple extends Fruit {
    @Override
    public String toString() {
        return "This is an Apple !!";
    }
}

class AsianApple extends Apple {
    @Override
    public String toString() {
        return "This is an AsianApple !!";
    }
}

```

We will also define a method that receives a `List<? super Apple>` .

```

public static void printApples(List<? super Apple> apples) {
    System.out.println(apples);
}

```

Now observe the following example. When we pass a list of `AsianApple` in the method 
`printApples(...)`, it gives us compile time error. But when we try to pass a list of 
`Fruit`, which is the super of `Apple`, it accepts it without any error.

Interesting thing to observe, we can add **AsianApple** in the 2nd list, and it is acceptable. 
But it is impossible to pass a list wholly of an unsupported type.

```

List<AsianApple> basket1 = new ArrayList<>();
basket1.add(new AsianApple());
printApples(basket1);   // Compilation error

List<Fruit> basket2 = new ArrayList<>();
basket2.add(new AsianApple());
basket2.add(new Apple());
basket2.add(new Fruit());
printApples(basket2);

```

Now, let's see some limitations of `extends` and `super`.

##### Limitations

- We can create a list like `List<? extends Apple>` and instantiate the list. But when we try to add elements in it, it will give us compilation error.

```

    Set<? extends Apple> appleSet = new HashSet<>();
    appleSet.add(new Apple());          // Compilation error
    appleSet.add(new AsianApple());          // Compilation error

```

The reason is becuase we actually don't need to mention `? extends`. If we define a list of `Apple`, it simply can accept any child of `Apple` type.

- However, we can define something like the following when we define it in one go.

```

    List<? super Apple> basket = List.of(new Apple(), new AsianApple());
    
    // Because we are populating all objects first, 
    // then assigning the list in the left side object.
    // So the above code satisfies the below valid condition
    
    List<? super Apple> basket = new ArrayList<Object>();

```

```

    List<? super Apple> basket1 = List.of(new Apple(), new AsianApple(), new Fruit(), new Object(), 123, 12.45);

```

The reason is because when we define with `List.of(...)` it actually accepts objects and produces a list of `Object`. And `List<Object>` is a type of `List<? super Apple>`.

- Notice the following example:

```

List<? super Apple> basket = new ArrayList<>();

basket.add(new Apple());    //Successful
basket.add(new AsianApple()); //Successful
// basket.add(new Fruit());    //Compile time error
// basket.add(new Object());    //Compile time error

```

Interesting fact here is, we were supposed to be able to add any super type of `Apple` in the list, but it seems to happen the opposite.
When we try to add items in a list demonstrated above, it only accepts the children of the `super` type.


#### PECS [Producer extends, Consumer super]

- If we want to produce items, e.g.: iterate over a list or get items from a list, we use extends.

The reason is that we cannot know which subtype or `Fruit` our collection will hold. 
So it is safe to get the object from the list and store in a `Fruit` type.

- If we want to add items in our collection, we use super.

The reason is that we don't care what are already stored in the collection. 
As long as we are adding a `Fruit` and it's subtype in the collection, the compiler doesn't complain. 

#### Where we cannot use Generic types

- With static fields

```

public class GenericsExample<T>
{
   private static T member; //This is not allowed
}

```

- We cannot instantiate any generic type

```

public class GenericsExample<T>
{
   public GenericsExample(){
      new T();
   }
}

```

- We cannot refer to premitive types with Generic type

```

final List<int> ids = new ArrayList<>();    //Not allowed
 
final List<Integer> ids = new ArrayList<>(); //Allowed

```

- We cannot create Generic exception classes

```

// causes compiler error
public class GenericException<T> extends Exception {}

```


That's all for this article. In our next article we will discuss on **Arrays with Generics**, **Using Generic type as parameter of a class** and **Using Generic types with method or constructor definition**.

Thank you for your patience and taking time to read this long article :)