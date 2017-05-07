---
layout: post
title: CH1 UNIX基础知识
categories: apue 学习笔记
date: 2017-02-03
---


1. unix 系统口令文件 /etc/passwd
文件格式:
登录名:加密口令:用户ID:组ID:注释字段:起始目录(/home/sar):shell程序(/bin/bash)
目前所有系统已将加密口令从该文件中移除

2. errno的两条规则：
	* 如果没有出错，则其值不会被一个例程清零。所以仅当函数的返回值指明出错时，才检验该值。
	* 任何一个函数都不会将errno设置为0

3. strerror: 返回一个字符串指针，指向解释errno的字符串。

	``` c
	char * strerror(int errnum);
	```

4. perror: 基于errno产生一条出错消息。[p1_6](p1_6.c)

	```c
	void perror(const char *msg);
	```
