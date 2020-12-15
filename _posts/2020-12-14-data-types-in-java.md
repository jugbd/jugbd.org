----
title: Data Types in Java?
author: Hasibul Islam
date: 2020-12-14T04:00:00.000+00:00
categories: ['Articles', 'Java']
comments: true
tags: ['Java', 'DataType']


----

# Data types in Java

Data types mainly represent the different sizes and values that can be stored in the variable.

## In Java Data types are divided into **two** groups:

- **Primitive data types:** The primitive data types include boolean, char, byte, short, int, long, float and double.
- **Non-primitive data types:** The non-primitive data types include Classes, Interfaces, and Arrays.

Here is a visual representation-

![Data types](https://static.javatpoint.com/images/java-data-types.png)

| Data Type |  Size   | Description                                                                       |
| :-------: | :-----: | :-------------------------------------------------------------------------------- |
|   byte    | 1 byte  | Stores whole numbers from -128 to 127                                             |
|   short   | 2 bytes | Stores whole numbers from -32768 to 32767                                         |
|    int    | 4 bytes | Stores whole numbers from -2,147,483,648 to 2,147,483,647                         |
|   long    | 8 bytes | Stores whole numbers from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 |
|   float   | 4 bytes | Stores fractional numbers. Sufficient for storing 6 to 7 decimal digits           |
|  double   | 8 bytes | Stores fractional numbers. Sufficient for storing 15 decimal digits               |
|  boolean  |  1 bit  | Stores true or false values                                                       |
|   char    | 2 bytes | Stores a single character/letter or ASCII values                                  |

**N:B:** Bit is the smallest segment in computer memory

> 1 byte = 8 bit

## Primitive Data Types:

---

Java support 8 types of primitive data types.

### Byte Data Type:

The byte data type is used to save memory in large arrays where the memory savings is most required. It saves space because a byte is 4 times smaller than an integer. It can also be used in place of "int" data type.  
**Example:**

> byte variableName = 15;

### Short Data Type:

The short data type can also be used to save memory just like byte data type. A short data type is 2 times smaller than an integer.  
**Example:**

> short variableName = 120;

### Int Data Type:

The int data type is generally used as a default data type for integral values unless if there is no problem about memory.  
**Example:**

> int variableName = 456123;

### Long Data Type:

The long data type is used when you need a range of values more than those provided by int.  
**Example:**

> long variableName = 2345678L;

### Float Data Type:

The float data type should never be used for precise values, such as currency. Its default value is 0.0F.  
**Example:**

> float variableName = 123.54F;

### Double Data Type:

The double data type is generally used for decimal values just like float. The double data type also should never be used for precise values, such as currency. Its default value is 0.0d.  
**Example:**

> double variableName = 65.45;

### Boolean Data Type:

The Boolean data type is used to store only two possible values: true and false. This data type is used for simple flags that track true/false conditions.  
**Example:**

> Boolean variableName = true;

### Char Data Type:

The char data type is a single 16-bit Unicode character. Its value-range lies between '\u0000' (or 0) to '\uffff' (or 65,535 inclusive).The char data type is used to store characters.  
**Examples:**

> char variableName = 'A';

## Non-Primitive Data Types:

---

Non-primitive data types are called reference types because they refer to objects.

The main difference between primitive and non-primitive data types are:

- Primitive types are predefined (already defined) in Java. Non-primitive types are created by the programmer and is not defined by Java (except for String).
- Non-primitive types can be used to call methods to perform certain operations, while primitive types cannot.
- A primitive type has always a value, while non-primitive types can be null.
- A primitive type starts with a lowercase letter, while non-primitive types starts with an uppercase letter.
- The size of a primitive type depends on the data type, while non-primitive types have all the same size.

## **Happy Learning :)**
