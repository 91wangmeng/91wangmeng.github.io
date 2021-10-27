title: jdk8新特性介绍
speaker: 汪萌萌
transition: slide3
files: /js/demo.js,/css/demo.css,/js/zoom.js
theme: moon
usemathjax: yes

[slide]
# jdk8若干特性介绍
<small>演讲者：汪萌萌</small>


[slide]
#都<span class="text-warning">9102</span>年了,jdk都11了,你还没用过<span class="text-danger">8</span>的特性????

[slide]
## 本次主题
----
* Lambda函数式表达式 {:&.rollIn}
* Stream流式操作
* 新的时间api(java.time;)

[slide]
## 什么是<span class="text-info">Lambda</span>?

[slide]

Java Lambda 表达式是 Java 8 引入的一个新的功能，可以说是模拟函数式编程的一个语法糖，类似于 Javascript 中的闭包，但又有些不同，主要目的是提供一个函数化的语法来简化我们的编码。Lambda表达式基于数学中的λ演算得名.

[slide]
Lambda 的基本结构为 `(arguments) -> body`，有如下几种情况：

> * 参数类型可推导时，不需要指定类型，如 `(a) -> System.out.println(a)`
* 当只有一个参数且类型可推导时，不强制写 (), 如`a -> System.out.println(a)`
* 参数指定类型时，必须有括号，如 `(int a) -> System.out.println(a)`
* 参数可以为空，如 `() -> System.out.println(“hello”)`
* body 需要用 {} 包含语句，当只有一条语句时 {} 可省略

稍后将结合stream进一步介绍

[slide]
## 函数式接口

> 我们把那些只拥有一个方法的接口称为函数式接口。（之前它们被称为SAM类型，即单抽象方法类型（Single Abstract Method））,编译器会根据接口的结构自行判断（判断过程并非简单的对接口方法计数：一个接口可能冗余的定义了一个Object已经提供的方法，比如toString()，或者定义了静态方法或默认方法，这些都不属于函数式接口方法的范畴）。不过API作者们可以通过@FunctionalInterface注解来显式指定一个接口是函数式接口，加上这个注解之后，编译器就会验证该接口是否满足函数式接口的要求。

[slide]  {:&.flexbox.vleft}
---
例如:
```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```
在jdk1.8以前
```java
Runnable runnable = new Runnable() {
            @Override
            public void run() {
                log.info("do something");
            }
        };
new Thread(runnable).start();
```
使用lambda
```java
new Thread(() -> log.info("do something")).start();
```

[slide]
## 其他常用的函数式接口还有
* `java.util.concurrent.Callable`
* `java.util.Comparator`
* `java.io.FileFilter`
* `java.lang.reflect.InvocationHandler`

[slide]
Java SE 8中增加了一个新的包：`java.util.function`，它里面包含了常用的函数式接口，例如：
* `Predicate<T>`——接收`T`对象并返回`boolean`
* `Consumer<T>`——接收`T`对象，不返回值
* `Function<T, R>`——接收`T`对象，返回`R`对象
* `Supplier<T>`——提供`T`对象（例如工厂），不接收值
* `UnaryOperator<T>`——接收`T`对象，返回`T`对象
* `BinaryOperator<T>`——接收两个`T`对象，返回`T`对象

[slide]
# Stream
> 我认为stream极大的简化了集合操作,降低了代码复杂度的同时提高了代码的可读性

[slide] {:&.flexbox.vleft}
---
## Stream的创建
### 通过集合
```java
Stream<Person> listStream = new ArrayList<Person>().stream();
Stream<Person> setStream = new HashSet<Person>().stream();
Stream<Map.Entry<String, Person>> mapStream = new HashMap<String, Person>()
                                                    .entrySet().stream();
```
### 通过数组
```java
Stream<Person> arrayStream = Arrays.stream(new Person[]{new Person(), new Person()});
```
### 通过单一元素
```java
Stream<Person> singelStream = Stream.of(new Person());
```
### 通过工厂方法
```java
Stream<Person> personStream = Stream.generate(() -> new Person()).limit(5)
```

[slide]  {:&.flexbox.vleft}
---
## Stream常用操作
* 过滤 {:&.rollIn}
* 排序
* 转换
* 截取|跳过
* 展开
* 累加
* 收集

[slide] {:&.flexbox.vleft}
--- 

## 初始化用户信息 
```java
 Person personOne = new Person("张三", 25, "中国");
        Person personTwo = new Person("李四", 17, "中国");
        Person personThree = new Person("王五", 33, "中国");
        Person personFour = new Person("Jack", 16, "美国");
        Person personFive = new Person("Bob", 26, "美国");
        Person personSix = new Person("Alien", 18, "美国");
        Person personSeven = new Person("Tom", 20, "加拿大");
        Person personEight = new Person("Jerry", 15, "加拿大");
        ArrayList<Person> personList = new ArrayList<>();
        personList.add(personOne);
        personList.add(personTwo);
        personList.add(personThree);
        personList.add(personFour);
        personList.add(personFive);
        personList.add(personSix);
        personList.add(personSeven);
        personList.add(personEight);
```
[slide]
---

## 过滤
> 过滤出年龄大于等于20岁的人员信息
>> 在jdk1.8以前
```java
Iterator<Person> iterator = personList.iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getAge() < 20) {
                iterator.remove();
            }
        }
```
>> 使用stream
```java
List<Person> fillerPersonList = personList
                .stream()
                .filter(person -> person.getAge() >= 20)
                .collect(Collectors.toList());
```
[slide]
---
## 排序
> 根据年龄顺序和逆序分别排序
>> 在jdk1.8以前
```java
Comparator<Person> personComparator = new Comparator<Person>() {
            @Override
            public int compare(Person o1, Person o2) {
                return o1.getAge()-o2.getAge();
            }
        };
        //顺序
personList.sort(personComparator.reversed());
//逆序
personList.sort(personComparator);
```
>> 使用Stream
```java
//顺序
List<Person> orderPersonList = personList.stream()
        .sorted(Comparator.comparingInt(Person::getAge))
        .collect(Collectors.toList());
//逆序
List<Person> reversePersonList = personList.stream()
        .sorted(Comparator.comparingInt(Person::getAge).reversed())
        .collect(Collectors.toList());
```

[slide]
---
## 转换

> 将人员列表转换为人员姓名列表
>> 在jdk1.8以前
```java
ArrayList<String> nameList = new ArrayList<>();
        for (Person person : personList) {
            nameList.add(person.getName());
        }
```
>> 使用Stream
```java
//顺序
List<String> nameList = personList.stream()
                .map(Person::getName)
                .collect(Collectors.toList());
```

[slide]
---
## 截取|跳过

> 获取年龄顺序排列前三名的人员信息
>> 在jdk1.8以前
```java
Comparator<Person> personComparator = new Comparator<Person>() {
            @Override
            public int compare(Person o1, Person o2) {
                return o1.getAge() - o2.getAge();
            }
        };
personList.sort(personComparator);
List<Person> newPeopleList = new ArrayList<>();
for (int i = 0; i < personList.size(); i++) {
    if (i < 3) {
        newPeopleList.add(personList.get(i));
    }
}
```
>> 使用Stream
```java
List<Person> newPersonListByStream = personList.stream()
                .sorted(Comparator.comparingInt(Person::getAge))
                .limit(3)
                .collect(Collectors.toList());
```
> `skip(num)`表示跳过num个元素

[slide]
---
## 展开
> 获取全校学生列表
>> 初始化数据
```java
List<Person> classOne = init();
List<Person> classTwo = init();
List<Person> classThree = init();
List<List<Person>> classes = new ArrayList<>();
classes.add(classOne);
classes.add(classTwo);
classes.add(classThree);
```
>> 在jdk1.8以前
```java
ArrayList<Person> school = new ArrayList<>();
        for (List<Person> aClass : classes) {
            school.addAll(aClass);
        }
```
>> 使用Stream
```java
//顺序
List<Person> collect = classes.stream()
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
```

[slide]
---
## 累加
> 计算人员年龄总和
>> 在jdk1.8以前
```java
int sum = 0;
for (Person person : personList) {
    sum += person.getAge();
}
```
>> 使用Stream
```java
//顺序
int sumByStream = personList.stream().mapToInt(Person::getAge).sum();
或
int sumByStreamTwo = personList.stream().mapToInt(Person::getAge).reduce(0, (left, right) -> left + right);
```

[slide] {:&.flexbox.vleft}
## 收集 

### 分组 
> 将学生按照国籍分组
>> 1.8之前
```java
Map<String, List<Person>> groupByCountry = new HashMap<>();
        for (Person person : personList) {
            String country = person.getCountry();
            if (groupByCountry.get(country) == null) {
                groupByCountry.put(country, new ArrayList<>());
            }
            groupByCountry.get(country).add(person);
        }
```
>>
>> 使用Stream
```java
Map<String, List<Person>> groupByCountryWithStream = personList
                .stream()
                .collect(Collectors.groupingBy(Person::getCountry));
```

[slide] {:&.flexbox.vleft}
### 分区
> 将学生按照本国和外国分组
>> 1.8之前
```java
Map<Boolean, List<Person>> groupByCountry = new HashMap<>();
        for (Person person : personList) {
            Boolean country = "中国".equals(person.getCountry());
            if (groupByCountry.get(country) == null) {
                groupByCountry.put(country, new ArrayList<>());
            }
            groupByCountry.get(country).add(person);
        }      
```
>> 使用Stream
```java
Map<Boolean, List<Person>> groupByCountryWithStream = personList
                .stream()
                .collect(Collectors.partitioningBy(person -> "中国".equals(person.getCountry())));
```

[slide]
---
## 总结
> 获取各个国家年龄20岁以上,年龄最小的人员信息
>> 1.8之前
```java
List<Person> personArrayList = new ArrayList<>();
Map<String, Person> groupByCountry = new HashMap<>();
for (Person person : personList) {
    if (person.getAge() > 20) {
        String country = person.getCountry();
        if (groupByCountry.get(country) == null) {
            groupByCountry.put(country, person);
            continue;
        }
        if (groupByCountry.get(country).getAge()>person.getAge()) {
            groupByCountry.put(country, person);
        }
    }
}
personArrayList.addAll(groupByCountry.values());
```
>> 使用lambda
```java
List<Person> collect = personList.stream()
                .filter(person -> person.getAge() > 20)
                .collect(Collectors.groupingBy(Person::getCountry))
                .entrySet()
                .stream()
                .map(stringListEntry -> stringListEntry
                        .getValue()
                        .stream()
                        .sorted(Comparator.comparingInt(Person::getAge))
                        .limit(1)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException(stringListEntry.getKey() + "没人")))
                .collect(Collectors.toList());
```

[slide]
---
# 新的时间api
* Instant {:&.rollIn}
* LocalDate 
* LocalTime
* LocalDateTime

[slide] {:&.flexbox.vleft}
## Instant
> Instant 表示一个 EPOCH 时间戳（即以 0 表示 1970-01-01T00:00:00Z），精确到纳秒。Instant 对象不包含时区信息，且值是不可变的
```java
//时间戳(毫秒)
long epochMilli = Instant.now().toEpochMilli();
//时间戳(秒)
long epochSecond = Instant.now().getEpochSecond();
```
[slide] {:&.flexbox.vleft}
## LocalDate 
> 本地日期,表示年月日，其精确度到天。它是不包含时分秒的
```java
//今天
LocalDate today = LocalDate.now();
//昨天
LocalDate yesday = LocalDate.now().minusDays(1);
//明天
LocalDate tomorrow = LocalDate.now().plusDays(1);
//指定年月日
LocalDate someDay = LocalDate.of(2019, 1, 1);
//根据字符串获取日期
LocalDate.parse("2019-01-01");
//今天是本年中的第几天
int dayOfYear = LocalDate.now().getDayOfYear();
//今天是本月中的第几天
int dayOfMonth = LocalDate.now().getDayOfMonth();
//本月第一天
LocalDate startOfThisMonth = LocalDate.now().withDayOfMonth(1);
//本月最后一天
LocalDate endOfThisMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
//两个日期相差多少天
long untilDay = LocalDate.now().until(LocalDate.now().withDayOfMonth(1), ChronoUnit.DAYS);
//两个日期相差多少月
long untilMonth = LocalDate.now().until(LocalDate.now().withMonth(5), ChronoUnit.MONTHS);
//两个日期相差多少年
long untilYear = LocalDate.now().until(LocalDate.now().withYear(2018), ChronoUnit.YEARS);
//过去三十天日期列表
AtomicInteger atomicInteger = new AtomicInteger(0);
List<LocalDate> next30Days = Stream.generate(() -> LocalDate.now().minusDays(atomicInteger.incrementAndGet())).limit(30).collect(Collectors.toList());
```

[slide] {:&.flexbox.vleft}
## LocalTime
> 表示一天当中的时间，其精确度到纳秒。它是不包含年月日的。
```java
//当前时间
LocalTime now = LocalTime.now();
//上个小时
LocalTime lastHourTime = now.minusHours(1);
//下个小时
LocalTime nextHourTime = now.plusHours(1);
//00:00:00
LocalTime min = LocalTime.MIN;
//中午12:00
LocalTime noon = LocalTime.NOON;
//23:59:59
LocalTime max = LocalTime.MAX;
//指定时间
LocalTime someTime = LocalTime.of(12, 0);
//获取当前系统默认时区的时间
LocalTime nowWithTimeZone = LocalTime.now(ZoneId.systemDefault());
//获取指定时区的当前时间
LocalTime utc = LocalTime.now(ZoneId.ofOffset("UTC", ZoneOffset.ofHours(0)));
```

[slide]
## LocalDateTime
> 既包含日期也包含时间，但是不包含时区。它实际上就是 LocalDate 和 LocalTime 的组合。
```java
 //当前时间
LocalDateTime now = LocalDateTime.now();
//获取今天起始时间
LocalDateTime startOfToady = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
//获取今天截止时间
LocalDateTime endOfToady = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
//比较两个时间的先后
boolean after = LocalDateTime.now().isAfter(LocalDateTime.MIN);
boolean before = LocalDateTime.now().isBefore(LocalDateTime.MIN);
//获取当前的时间戳
long epochSecond = LocalDateTime.now().toEpochSecond(OffsetDateTime.now().getOffset());
//根据时间戳获取时间
LocalDateTime.ofEpochSecond(epochSecond, 0, OffsetDateTime.now().getOffset());
//格式化
String format = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
```
