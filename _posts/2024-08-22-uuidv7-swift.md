---
layout: post
title: UUID v7 in Swift
---
<p class="message">
<strong>TL;DR</strong> The new and improved UUID version 7 has arrived. It shares the strengths of its
predecessors, v1 and v4, but is a better identifier for scaling software. Keep reading to learn
about the evolution of the UUID data type and how to implement version 7 in your Swift project.
</p>
  
__________________________________

Universally Unique Identifiers (**UUIDs**) have been around since the 1980s[^history] and are baked into 
almost every programming language[^languages] and database management system[^dbms].  They are a safe and
 effective mechanism to assign identity to objects across large systems. Stated simply in the proposed 
 standard [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562): 
> A UUID... is intended to guarantee uniqueness across space and time

[^history]:  [A brief history of the UUID](https://segment.com/blog/a-brief-history-of-the-uuid/) from [Twilio Segment](https://segment.com).
[^languages]: See docs for [Python](https://docs.python.org/3/library/uuid.html), [Swift](https://developer.apple.com/documentation/foundation/uuid), [C#](https://learn.microsoft.com/en-us/dotnet/api/system.guid.newguid?view=net-8.0), and [Java](https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html)
[^dbms]: See docs for [Oracle](https://docs.oracle.com/en/database/other-databases/nosql-database/21.1/sqlreferencefornosql/using-uuid-data-type.html), [MySQL](https://dev.mysql.com/doc/refman/5.7/en/miscellaneous-functions.html#function_uuid), [SQL Server](https://learn.microsoft.com/en-us/sql/t-sql/data-types/uniqueidentifier-transact-sql?view=sql-server-ver16), and [PostgreSQL](https://www.postgresql.org/docs/current/datatype-uuid.html)

This is incredibly useful as a programmer! Imagine a social media mobile app generating millions of posts everyday. Each post can receive a `UUID` without needing to coordinate with a central server. Developers can allow users to create posts offline and be reasonably assured that no other post will have the same `ID`[^ids].

[^ids]: While the probability of a collision is negligible, it is not zero. See this explanation on [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier#Collisions).

  Most developers I talk with understand the concept of a `UUID` and use them frequently, 
  but few understand exactly what a `UUID` is or how it's created (including me a few weeks ago). 

___________________________________

- [Anatomy of a UUID](#anatomy-of-a-uuid)
  - [Version 1](#version-1)
  - [Version 4](#version-4)
  - [Version 7](#version-7)
- [UUID v7 in Swift](#uuid-v7-in-swift)
  - [Reworking the solution](#reworking-the-solution)
  - [Should I implement it?](#should-i-implement-it)
- [What's next?](#whats-next)
- [Sources and Notes](#sources-and-notes)

## Anatomy of a UUID

A `UUID` is a 128-bit data object composed primarily of randomly generated numbers with a little bit of identifying information sprinkled in. Below is the same `UUID` represented in three variations: *binary*, *number*, and *hexadecimal*.
##### Binary
```
01010101000011101000010000000000111000101001101101000001110101001010011100010110010001000110011001010101010001000000000000000000
```

##### Number
`113059749145936325402354257176981405696`[^numeric]

[^numeric]: *One hundred thirteen undecillion fifty-nine decillion seven hundred forty-nine nonillion one hundred forty-five octillion nine hundred thirty-six septillion three hundred twenty-five sextillion four hundred two quintillion three hundred fifty-four quadrillion two hundred fifty-seven trillion one hundred seventy-six billion nine hundred eighty-one million four hundred five thousand six hundred ninety-six* per Edward Furey's "[Numbers to Words Converter](https://www.calculatorsoup.com/calculators/conversions/numberstowords.php)" at [Calculator Soup](https://www.calculatorsoup.com).

##### Hexadecimal
`550e8400-e29b-41d4-a716-446655440000`


The hex representation above is what we most commonly encounter in programming. Whilst I'm guilty of mentally cataloging a `UUID` as a `String` type (which is fine in most contexts), understanding the components of a `UUID` requires breaking down each bit.

Every `UUID` in hex is made of 32 characters (ignoring dashes), each representing 4 bits[^hex]. Some bits are generated from random values but others have important roles to play. There are **8** different versions of `UUID` but for now we'll just focus on the original **Version 1**, the most common **Version 4**, and the new **Version 7**. 

[^hex]: Hexadecimal values can represent any number between 0-15 with a single character (0-9, A-F). Learn more with this [digital guide](https://www.ionos.co.uk/digitalguide/server/know-how/hexadecimal-system/) by [Ionos](https://www.ionos.co.uk).

### Version 1
[Version 1](https://www.rfc-editor.org/rfc/rfc9562#name-uuid-version-1) is the most complex of the three. Here is the makeup:

|Bits| Values |
|---|---|
| 0 - 47 | First 48 bits of a timestamp |
| 48 - 51 | 4-bit version number |
| 52 - 63 | Last 12 bits of the timestamp |
| 64 - 65 | 2-bit variant number |
| 66 - 79 | Clock sequence |
| 80 - 127 | Node (MAC Address) |

Imperfectly[^variant] illustrated below:<br> 

![Breakdown of UUID version 1](/images/2024-08-22-uuidv7/version1.jpeg)

[^variant]: The variant is only two bits, but for simplicity is expressed as four bits when highlighting its place in the hexadecimal `UUID`

The inclusion of a computer's identifying information at the end of the `UUID` is useful for ensuring uniqueness but problematic for privacy. To address this issue, [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122) proposed a new standard...

### Version 4
[Version 4](https://www.rfc-editor.org/rfc/rfc9562#name-uuid-version-4) is almost completely random and is the standard adopted 
by most software systems at the time of writing[^languages] [^dbms].

|Bits| Values |
|---|---|
| 0 - 47 | 48 bits of random data |
| 48 - 51 | 4-bit version number |
| 52 - 63 | 12 bits of random data |
| 64 - 65 | 2-bit variant number |
| 66 - 127 | 62 bits of random data |

![Breakdown of UUID version 4](/images/2024-08-22-uuidv7/version4.jpeg)

Version 4 solves the privacy hole of v1, but lacks an important feature that makes it less than ideal as a primary key in a database: *sortability*.

### Version 7

Version 7 was proposed by [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562) in May 2024 to better meet the needs of modern day distributed systems.

|Bits| Values |
|---|---|
| 0 - 47 | 48 bits of timestamp |
| 48 - 51 | 4-bit version number |
| 52 - 63 | 12 bits of random data |
| 64 - 65 | Variant number |
| 66 - 127 | 62 bits of random data |

![Breakdown of UUID version 7](/images/2024-08-22-uuidv7/version7.jpeg)

The re-inclusion of the timestamp introduces sortability to version 7 while maintaining the anonymity of version 4. I recommend reading
 the proposal's [motivation](https://www.rfc-editor.org/rfc/rfc9562#name-update-motivation) for creating a new version. Here's an excerpt:
 > One area in which UUIDs have gained popularity is database keys. This stems from the increasingly distributed nature of modern applications. 
 > In such cases, "auto-increment" schemes that are often used by databases do not work well: the effort required to coordinate sequential 
 > numeric identifiers across a network can easily become a burden. The fact that UUIDs can be used to create unique,
 > reasonably short values in distributed systems without requiring coordination makes them a good alternative

<br>

## UUID v7 in Swift
Even though Swift has a first-party `UUID` data-type, 
[its initializers](https://developer.apple.com/documentation/foundation/uuid/1780249-init) only produce a version 4 `UUID`. 
If you're hoping to use version 7 in your project, you're in luck! [**Anton Zhiyanov**](https://antonz.org/), an absolutely cracked engineer,
 has already written version 7 in [Swift](https://antonz.org/uuidv7/#swift) and many [other languages](https://antonz.org/uuidv7) 
 with the help of the open source community. Let's take a look at the implementation[^mycomments]:

 [^mycomments]: The function has been modified to reduce whitespace and add explanatory comments. The relevant code is the same.

{% highlight swift %}
extension UUID {
  static func v7() -> Self {

    // 1 - Empty and random bytes
    var value = (
      UInt8(0),
      UInt8(0),
      UInt8(0),
      UInt8(0),
      UInt8(0),
      UInt8(0),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255),
      UInt8.random(in: 0...255)
    )
    
    // 2 - Timestamp in milliseconds
    let timestamp: Int = .init(
      Date().timeIntervalSince1970 * 1000
    )
    
    // 3 - Encode timestamp
    value.0 = .init((timestamp >> 40) & 0xFF)
    value.1 = .init((timestamp >> 32) & 0xFF)
    value.2 = .init((timestamp >> 24) & 0xFF)
    value.3 = .init((timestamp >> 16) & 0xFF)
    value.4 = .init((timestamp >> 8) & 0xFF)
    value.5 = .init(timestamp & 0xFF)
    
    // 4 - Encode version and variant
    value.6 = (value.6 & 0x0F) | 0x70
    value.8 = (value.8 & 0x3F) | 0x80
    
    return UUID(uuid: value)
  }
}
{% endhighlight %}


The implementation steps are:
1. Create a 16-member tuple of eight-bit integers in which the first six members are empty and the next ten have a random value.
2. Get the time elapsed since Epoch in milliseconds.
3. Using [bitwise shift operators](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators/#Bitwise-Left-and-Right-Shift-Operators), encode the first six bytes with the timestamp.
4. Encode the version and variant.

### Reworking the solution
On [Anton's website](https://antonz.org/uuidv7), he is very clear about one thing:
> These implementations may not be the fastest or most idiomatic, but they are concise and easy to understand.

As an iOS developer, I would argue that writing code in "idiomatic" Swift is both concise and easy to understand. For the purpose of practice 
let's make a few modifications to simplify this function:

First we'll swap out the shorthand initializer call with a standard `Int` initializer and use the `Date.now` which is a bit 
more expressive [^expressivedate].

[^expressivedate]: The `.now` static variable was [introduced](https://developer.apple.com/documentation/foundation/date/3766590-now) in iOS 15. If you need to support an older version, use `Date()`

{% highlight swift %}
let timestamp = Int(Date.now.timeIntervalSince1970 * 1000)
{% endhighlight %}

I'm all for using inferred types when the type is clear from the intializer. In the case of a 16-member tuple, I would rather 
see an explicit type declaration. Thankfully iOS 17 has a [type alias](https://developer.apple.com/documentation/foundation/uuid_t) 
for it: `uuid_t`. I will also rename `value` to `uuidBytes` to remind me that each element is a byte.

{% highlight swift %}
let uuidBytes: uuid_t
{% endhighlight %}

We can avoid unncessary mutation of the tuple's members by initializing the `uuid_t` with the data directly.

{% highlight swift %}
let uuidBytes: uuid_t = (
    UInt8((timestamp >> 40) & 0xFF),
    UInt8((timestamp >> 32) & 0xFF),
    UInt8((timestamp >> 24) & 0xFF),
    UInt8((timestamp >> 16) & 0xFF),
    UInt8((timestamp >> 8) & 0xFF),
    UInt8(timestamp & 0xFF),
    UInt8.random(in: 0...255) & 0x0F | 0x70,
    UInt8.random(in: 0...255),
    UInt8.random(in: 0...255) & 0x3F | 0x80,
    UInt8.random(in: 0...255),
    UInt8.random(in: 0...255),
    UInt8.random(in: 0...255),
    UInt8.random(in: 0...255),
    UInt8.random(in: 0...255),
    UInt8.random(in: 0...255),
    UInt8.random(in: 0...255)
)
{% endhighlight %}

All together now:

{% highlight swift %}
extension UUID {
  static func v7() -> Self {
    // Use `Date()` if targeting iOS 14 or below
    let timestamp = Int(
      Date.now.timeIntervalSince1970 * 1000
    ) 
    
    // Remove `uuid_t` or create your own 
    // typealias if targeting iOS 16 or below
    let uuidBytes: uuid_t = (
       UInt8((timestamp >> 40) & 0xFF),
       UInt8((timestamp >> 32) & 0xFF),
       UInt8((timestamp >> 24) & 0xFF),
       UInt8((timestamp >> 16) & 0xFF),
       UInt8((timestamp >> 8) & 0xFF),
       UInt8(timestamp & 0xFF),
       UInt8.random(in: 0...255) & 0x0F | 0x70, // version
       UInt8.random(in: 0...255),
       UInt8.random(in: 0...255) & 0x3F | 0x80, // variant
       UInt8.random(in: 0...255),
       UInt8.random(in: 0...255),
       UInt8.random(in: 0...255),
       UInt8.random(in: 0...255),
       UInt8.random(in: 0...255),
       UInt8.random(in: 0...255),
       UInt8.random(in: 0...255)
   )
    
    return UUID(uuid: uuidBytes)
  }
}
{% endhighlight %}

Not only have we reduced the line count[^linecount] of the `v7()` function from **31** to **23** lines,
but also made the structure of the UUID more obvious at first glance - we can see all 16 bytes and their 
respective values without jumping around the code. We could spend more time optimizing the readability 
of this function but I think this is a reasonable compromise with the existing solution.

[^linecount]: Excluding comments and whitespace.

## Should I implement it?
If you're designing database schemas: **YES** - at least for new tables. The impact that time sorted primary-keys have 
have on database-index locality (and thereby query performance) is too tempting to be ignored [^locality].

[^locality]: See the first bullet point in the [Motivation](https://www.rfc-editor.org/rfc/rfc9562#name-update-motivation) section of RFC 9562.

In all other cases, I would say **probably not**. While it's fun to have the latest standard, I recommend 
waiting until your favorite language releases a first-party implementation. The benefits don't outweigh the risk
of rolling your own solution - you can be assured that Apple/Google/Oracle's implementation 
will be secure, performant, and sufficiently random. As of now I'm happy to use the built-in `UUID` and sort my objects
with an old-fashioned `Date` property.

# What's next?
Just because I don't plan to use Version 7 in my personal projects doesn't mean I'm done experimenting with it. 
The improved readability is great, sure, but is it fast? Next week let's run our `v7()` through some 
speed tests and see how it performs compared to the `v4` implementation in iOS.

<p class="message">
If you think I need to clarify or correct any part of this article, please send me a message via 
<a href="https://www.twitter.com/nathandud">Twitter (X)</a> or
<a href="mailto:nathan@dudleydev.com">email</a>. 
You can also submit a <a href="https://github.com/nathandud/nathandud.github.io">pull request</a>.
</p>

_______________________________________

## Sources and Notes






