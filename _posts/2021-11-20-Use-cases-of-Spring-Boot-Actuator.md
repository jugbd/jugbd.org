---
title: Use cases of Spring Boot Actuator
author: Elias Hasnat
date: 2021-11-20 04:00:00 +0900
categories:
- Article
- News
comments: false
tags:
- Java
- JUGBD
- JUG
- Bangladesh
- Dhaka
image: ''

---

# Use cases of Spring Boot Actuator


![image](https://github.com/claymodel/exampleremove/blob/main/actuator.jpg)

When developing with Spring, it is often tempting to check the information registered on the backend.
There are many things we want to check, such as, whether the component is scanned properly and the bean is registered, the property setting value is registered, and so on.
We can check these by doing logs output as debug effort, but I think it is quite troublesome.

Spring Boot Actuator is recommended in such a case.
I thought it would be convenient to use it.

What is Spring Boot Actuator?

You can get useful information for monitoring, management, and development provided by Spring Boot.
It can be obtained from HTTP/JMX by embedding it in the application.


Lets try

First of all, I will try to incorporate it so that it works.
It's very easy to use because all you have to do is define the dependencies.


edit pom.xml

```
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```

After adding the dependency, you can check the valid endpoints in JSON format by starting the Spring Boot application and executing the curl command as shown below.
The same is true if you run it on your browser. 


```
$ curl -XGET localhost:8080/actuator
{"_links":{"self":{"href":"http://localhost:8080/actuator","templated":false},"health":{"href":"http://localhost:8080/actuator/health","templated":false},"health-path":{"href":"http://localhost:8080/actuator/health/{*path}","templated":true},"info":{"href":"http://localhost:8080/actuator/info","templated":false}}}
```

The Prefix when using Actuator is "/ actuator" by default, but it can be changed by setting it.
The port number can also be set exclusively for the Actuator. 

```
# Prefix when using Actuator
management.endpoints.web.base-path=/admin
# Port number when usinf Actuator
management.server.port=9999
```

By default, the available endpoints have only health and info enabled.
Separate settings are required to enable these.

If you want to enable it uniformly, you can enable it by setting as follows. 

```
vi application.properties
```

```
management.endpoints.web.exposure.include=*
```

If you check the endpoint again after setting, you can see that more of them are enabled.

```
$ curl -XGET localhost:8080/actuator/
{"_links":{"self":{"href":"http://localhost:8080/actuator","templated":false},"beans":{"href":"http://localhost:8080/actuator/beans","templated":false},"caches-cache":{"href":"http://localhost:8080/actuator/caches/{cache}","templated":true},"caches":{"href":"http://localhost:8080/actuator/caches","templated":false},"health":{"href":"http://localhost:8080/actuator/health","templated":false},"health-path":{"href":"http://localhost:8080/actuator/health/{*path}","templated":true},"info":{"href":"http://localhost:8080/actuator/info","templated":false},"conditions":{"href":"http://localhost:8080/actuator/conditions","templated":false},"shutdown":{"href":"http://localhost:8080/actuator/shutdown","templated":false},"configprops":{"href":"http://localhost:8080/actuator/configprops","templated":false},"env-toMatch":{"href":"http://localhost:8080/actuator/env/{toMatch}","templated":true},"env":{"href":"http://localhost:8080/actuator/env","templated":false},"loggers-name":{"href":"http://localhost:8080/actuator/loggers/{name}","templated":true},"loggers":{"href":"http://localhost:8080/actuator/loggers","templated":false},"heapdump":{"href":"http://localhost:8080/actuator/heapdump","templated":false},"threaddump":{"href":"http://localhost:8080/actuator/threaddump","templated":false},"metrics-requiredMetricName":{"href":"http://localhost:8080/actuator/metrics/{requiredMetricName}","templated":true},"metrics":{"href":"http://localhost:8080/actuator/metrics","templated":false},"scheduledtasks":{"href":"http://localhost:8080/actuator/scheduledtasks","templated":false},"mappings":{"href":"http://localhost:8080/actuator/mappings","templated":false}}}
```

In the above example, all the endpoints are exposed, but it is safe to enable only the ones that are originally used.
Originally, Actuator endpoints were protected by default, but since Spring Boot 2.0 they are no longer protected.
Therefore, Spring Security must be set individually so that only the administrator can safely access the endpoint.

Other than that, it is possible to make it inaccessible by specifying an endpoint that you do not want to explicitly expose in the settings. 


```
vi application.properties
```

```
management.endpoints.web.exposure.exclude=env
```

# Things that can be used practically 

I wondered which one could be used for development
there are several wyas to be tried 

* beans
* env
* mappings
* loggers
* health
* shutdown

# Kubernetes Probe Control

## beans

You can check the list of beans registered in the application.
(In Spring Boot, innumerable beans registered by Auto Configration are displayed)

Since the scope of the registered bean can be checked at the same time, I think that it is possible to prevent the risk of accidents due to not being registered in the intended scope. 

## env

You can check the value of the property registered in the Enviroment object in the list.
It is very convenient because you can check whether the setting value is switched normally depending on the operating environment.

The only caveat is that the settings may contain information such as IP address and user / password.
Of course, these can't be exposed to the outside world, so I think it's best to secure the endpoint or not enable it in the first place. 

## mappings

You can check the access points defined by @RequestMapping in a list.
I thought it would be useful for investigating cases where access is not possible due to 404 etc.
If it was not registered as an access point, is the Controller class properly registered as a component? It seems good to check such things. 

## loggers

You can check and change the log level while the application is running.
In development, I think there are situations where you do not want to adjust the required log level or output unnecessary logs, so it is quite practical.

For example, suppose that the log level output on the Spring side by Logback is set to INFO as shown below. 

```
<logger name="org.springframework" level="INFO">
    <appender-ref ref="console" />
</logger>
```

If you start the application with this setting and check the log level from the endpoint, you can confirm that it is INFO.
The effectiveLevel is the log level that is actually applied. 

```
$ curl -XGET localhost:8080/actuator/loggers/org.springframework
{"configuredLevel":"INFO","effectiveLevel":"INFO"}
```

If you want to change this log level from INFO to DEBUG, you can change it by accessing the endpoint point.
It can be changed by accessing with POST as follows. 

```
$ curl -XPOST localhost:8080/actuator/loggers/org.springframework -H "Content-Type: application/json" -d"{\"configuredLevel\": \"DEBUG\"}"
```

If you check the log level again, you can see that it has been changed to DEBUG. 

```
$ curl -XGET localhost:8080/actuator/loggers/org.springframework
{"configuredLevel":"DEBUG","effectiveLevel":"DEBUG"}
```

## health

It's simple, but it shows the health information of the application. 

```
$ curl -XGET localhost:8080/actuator/health
{"status":"UP"}
```

## shutdown

You may not use it much in development, but you can stop the application via the endpoint.
To enable it, only shutdown needs to be set separately. 

edit in application.properties

```
management.endpoint.shutdown.enabled=true
```

You can stop it by simply executing the following while it is enabled. 

```
$ curl -XPOST localhost:8080/actuator/shutdown
{"message":"Shutting down, bye..."}
```

Since it can be stopped with just one access, if it is enabled, the security protection settings must be strict so that only the administrator can operate it.
Or it seems better to disable the endpoint itself if you don't need it.
It's very scary that anyone can stop the application


# Kubernetes Probe control

When converting a Spring Boot application into a container and running it on Kubernetes, I want to specify the Spring Boot Actuator in the Kubernetes Probe. 

# What is probe?

Probe is a feature for Kubernetes to monitor containers in pods.

There are the following three types of Probes. 

| Name | Description | What to do if Probe fails |
| :--- | :--- | :--- |
| Startup Probe | Determine if the container startup process is complete. After confirming the success of Startup Probe, the subsequent Probe will be executed.  | The container will be restarted  |
| Liveness Probe | Determine if the container needs to be restarted. | The container will be restarted  |
| Readinesss Probe | Determine if the container can be the load balancing target by Service.  | Excluded from load balancing by Service (container is not restarted)  |

There are three specific methods for executing Probe. 

| # | Description | What to do if Probe fails |
| :--- | :--- | :--- |
| 1 | httpGet  | Send an HTTP GET request to a specific port number / path of the container, and if the status code of the response is 200 or more and less than 400, it succeeds, otherwise it fails. |
| 2 | tcpSocket | Success if TCP connection can be established with a specific port number of the container, failure otherwise |
| 3 | exec | Execute a specific command in the container, if 0 is returned, it succeeds, otherwise it fails |

For web applications like those created with Spring Boot, you will often use 1. 

# Spring Boot Actuator Probe support 

Specifically, the following Actuator endpoints have been added. 

| End Point | Corresponding Probe |
| :--- | :--- |
| /actuator/health/liveness | Liveness Probe  |
| /actuator/health/readiness | Readiness Probe |

# Actuator usage procedure 
1. Add Maven Dependency as explained above
2. application.properties settings

There are two ways to activate the Probe's Actuator endpoint (only one is OK).

Set management.endpoint.health.probes.enabled = true in application.properties
Run on Kubernetes (it seems to check if there are environment variables * _SERVICE_HOST and * _SERVICE_PORT)
It doesn't hurt to have management.endpoint.health.probes.enabled = true when running on Kubernetes, so basically method 1 is fine.

All you have to do is publish your health endpoint.

To summarize the above, it is OK if you write application.properties as follows. 

```
management.endpoint.health.probes.enabled=true
management.endpoints.web.exposure.include=health
```

# Description in the Kubernetes manifest 

Specify the Actuator path in the path field. 

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example
  labels:
    app: exaple
spec:
  replicas: 1
  selector:
    matchLabels:
      app: example
  template:
    metadata:
      labels:
        app: example
    spec:
      containers:
        - name: example
          image: example:0.0.1
          ports:
            - containerPort: 8080
          ...
          livenessProbe:
            initialDelaySeconds: 10
            httpGet:
              port: 8080
              path: /actuator/health/liveness
            periodSeconds: 5
            timeoutSeconds: 1
            successThreshold: 1
            failureThreshold: 1
          readinessProbe:
            initialDelaySeconds: 10
            httpGet:
              port: 8080
              path: /actuator/health/readiness
            periodSeconds: 5
            timeoutSeconds: 1
            successThreshold: 1
            failureThreshold: 2
...
```

# Conclusion

It is not only convenient from a monitoring and management point of view, but it also has a lot of benefits for developers.
I think it is highly useful because it visualizes information that was difficult to see when you wanted to check it.



