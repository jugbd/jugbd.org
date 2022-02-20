---
title: All about Generics
author: Syed Mainul Hasan
date: 2022-02-19 01:45:00 +0000
type: post
categories: [Tutorial, Java]
tags: [Java, JUGBD, JUG, Generics]
comments: true
---

## Advantages

1. Type-safety
2. Type casting is not required
3. Compile-Time Checking

## Generics upper bound and lower bound

To understand, first define some classes with parent-child relationships.
```
class GrandPa {}
class Son extends GrandPa {}
class Daughter extends GrandPa {}
class GrandChild1 extends Son {}
class GrandChild2 extends Daughter {}
class GrandChild3 extends Son {}
```

### Upper bound

* Upper bound works at definition level. With upper bound at definition level, we can never use wildcard.

Example of definition level:

```
class GenericsUpperBoundTest <T extends Daughter>{
    List<T> list = new ArrayList<>();
}
```

In the above example, we are using upper bound as Daughter for generic type T, while defining the class
The generic type T is only working with the field `list` here because the same generic type is passed through the class.

**Another example of Upper bound usage while in definition level:**

In the below example, we are using upper bound as Son for generic type P, while defining the method


```
    public <P extends Son> void addSon(P p){
        System.out.println(p);
    }
    
    ...........................................
    
    upperBoundTest.addSon(son);
    upperBoundTest.addSon(grandChild1);
    upperBoundTest.addSon(grandChild3);
    
```

* At definition level, we can never use wildcard, rather it requires a specific generic type. So the following code will be invalid.

```
class GenericsUpperBoundTest <? extends Daughter>{}

```

* However, we can use upper bounded wildcard in the below scenarios.


```
List<? extends GrandPa> childrenOfGrandPa = List.of(new GrandPa(), new Daughter(), new GrandChild2());

```

This is a scenario of using wildcard in upper bound definition. This code will work.
We can call it definition level use case, because we defined the List and populated with value in one go

* Another example:

```
public void addSon(List<? extends Son> p){
    System.out.println(p);
}
```

Even though we said, wildcards cannot be used at definition level, but here we defined the method. Please note that, even though we defined the method, we didn't define the list items here.
Rather, we defined and populated them at some above point of caller method.

* In the below scenario, even though we tried like above approach of defining the list items, but it will not work while adding the items.

```
List<? extends Daughter> list = new ArrayList<>();
// All the below codes will give compile time error while trying to add items
    list.add(daughter);
    list.add(grandChild2); // sub type of daughter
    list.add(grandPa);
    list.add(son);
    list.add(grandChild1);
    list.add(grandChild3);
```

* If we try to use a generic type T with upper bound for the above example, it will fall back to compilation error.
   The reason is, at implementation level, it requires only an specific type

```
    List<T extends GrandPa> childrenOfGrandPa2 = new ArrayList<>(); // Will give compile time error
```

So we will write the code as follows to make it work.

```
List<GrandPa> childrenOfGrandPa2 = new ArrayList<>();
        childrenOfGrandPa2.add(new Daughter());
        childrenOfGrandPa2.add(new GrandChild2());
        
        
GenericsUpperBoundTest<Daughter> upperBoundTest = new GenericsUpperBoundTest<>();
        upperBoundTest.list.add(new Daughter());
        upperBoundTest.list.add(new GrandChild2());
        
         // however, followings are out of upper bound reach, because our defined generic class only accepts the children of Daughter class
         upperBoundTest.list.add(new GrandPa());
         upperBoundTest.list.add(new Son());
         upperBoundTest.list.add(new GrandChild1());
         upperBoundTest.list.add(new GrandChild3());

```

Hence, we can say, we can not use wildcard with upper bound, if it is at definition level. But we can use wildcard with upper bound during declaration and passing through method as parameter.

#### Full code example:

```
class GenericsUpperBoundTest <T extends Daughter>{

    List<T> list = new ArrayList<>();

    public static void main(String[] args) {
        // This is an exceptional example of using wildcard in upper bound definition. This code will work.
        // We can call it definition level use case, because we defined the List and populated with value in one go
        List<? extends GrandPa> childrenOfGrandPa = List.of(new GrandPa(), new Daughter(), new GrandChild2());

        List<GrandPa> childrenOfGrandPa2 = new ArrayList<>();
        childrenOfGrandPa2.add(new Daughter());
        childrenOfGrandPa2.add(new GrandChild2());

        GenericsUpperBoundTest<Daughter> upperBoundTest = new GenericsUpperBoundTest<>();
        upperBoundTest.list.add(new Daughter());
        upperBoundTest.list.add(new GrandChild2());

        // however, followings are out of upper bound reach
         upperBoundTest.list.add(new GrandPa());
         upperBoundTest.list.add(new Son());
         upperBoundTest.list.add(new GrandChild1());
         upperBoundTest.list.add(new GrandChild3());

    }

    static public <P extends Son> void addSon(P p){
        System.out.println(p);
    }
}
```

## Lower bounded wildcard

* Lower bounded wildcard is never possible at definition level, rather we can use lower bounds at declaration and passing through the parameter

example: Both the below codes will prone to error.

```
class GenericsLowerBoundTest <? super Son> {
    List<?> list = new ArrayList<>(); // We can never use only wildcard passed through the class
}

```

or

```
    public <? super Son> void addSon(? p){ // We can never use wildcard to represent a type, but we could use the generic type T in the upper bound
        System.out.println(p);
    }
```

The reason is because, if we keep it as wildcard, we can not symbolify the type of variables or fields defined inside the class or method with the wildcard.


* Lower bound only works for any declaration, and also supports wildcard operator.

Example:

```
    List<? super Son> list = new ArrayList<>();
        list.add(new GrandChild1());
        list.add(new GrandChild3());
        list.add(new Son());
    // followings are out of lower bound reach
//        list.add(new GrandChild2());
//        list.add(new GrandPa());
//        list.add(new Daughter());
```

or,

```
    public void addSon(List<? super Son> list){
        System.out.println(list);
    }
```

We are calling the parameterization as declaration level because in the method's caller we defined the list and populated with data first. Then we passed the items in it.