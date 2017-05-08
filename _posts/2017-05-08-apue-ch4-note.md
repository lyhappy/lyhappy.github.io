---
layout: post
title: CH4 文件和目录
categories: APUE学习笔记
date: 2017-05-08
---


## stat、fstat and lstat

```c 
#include <sys/stat.h>
int stat(const char * restrict pathname, struct stat * restrict buf);
int fstat(int filedes, struct stat * buf);
int lstat(const char * restrict pathname, struct stat * restrict buf);
```
lstat函数类似于stat，当文件是一个符号链接时，lstat返回的是符号链接的信息，而不是链接所指文件的信息。

```c
struct stat {
	mode_t	st_mode;	/* file type & mode (permissions) */
	ino_t 	st_ino;		/* i-node number (serial number) */
	dev_t	st_dev;		/* device number (file system) */
	dev_t	st_rdev;	/* device number for special files */
	nlink_t st_nlink;	/* number of links */
	uid_t	st_uid;		/* user ID of owner */
	gid_t	st_gid;		/* group ID of owner */
	off_t	st_size;	/* size in bytes, for regular files */
	time_t	st_atime;	/* time of last access */
	time_t	st_mtime;	/* time of last modification */
	time_t	st_ctime;	/* time of last file status change */
	blksize_t	st_blksize;	/* best I/O block size */
	blkcnt_tst_blocks;	/* number of disk blocks allocated */
};
```

## 文件类型

使用命令`ls -l`可以查看文件属性，结果的第一列的第一个字符表示文件的属性
* **普通文件**(regular file) 一般用`-`表示，可以是文本文件，也可以是二进制文件
* **目录文件**(directory file) 一般用`d`表示，对于一个目录文件，任何具有权限的进程都可以读，但只有内核可以直接写目录文件。
* **块特殊文件**(block special file) 一般用`b`表示，提供对设备带缓冲的访问，每次访问以固定长度为单位进行。
* **字符特殊文件**(character special file) 一般用`c`表示，提供对设备不带缓冲的访问，每次访问长度可变。
* **FIFO**(named pipe) 一般用`p`表示，用于进程间通信。
* **套接字**(socket) 一般用`s`表示，用于进程间网络通信。
* **符号链接**(symbolic link) 一般用`l`表示，指向另一个文件。

文件类型信息包含在stat结构体的st_mode成员中，

```c
#define S_IFMT  00170000 		// 以下七个标记的掩码
#define S_IFSOCK 0140000 		// 套接字
#define S_IFLNK  0120000		// 符号链接 
#define S_IFREG  0100000		// 普通文件 
#define S_IFBLK  0060000 		// 块特殊文件
#define S_IFDIR  0040000 		// 目录文件
#define S_IFCHR  0020000 		// 字符特殊文件
#define S_IFIFO  0010000 		// 管道或FIFO
#define S_ISUID  0004000 		// 设置用户ID， 下节讲到
#define S_ISGID  0002000 		// 设置组ID, 下节讲到
#define S_ISVTX  0001000
```

针对如上标记，有一组宏用来快速判断。
```c
#define S_ISLNK(m)  (((m) & S_IFMT) == S_IFLNK)
#define S_ISREG(m)  (((m) & S_IFMT) == S_IFREG)
#define S_ISDIR(m)  (((m) & S_IFMT) == S_IFDIR)
#define S_ISCHR(m)  (((m) & S_IFMT) == S_IFCHR)
#define S_ISBLK(m)  (((m) & S_IFMT) == S_IFBLK)
#define S_ISFIFO(m) (((m) & S_IFMT) == S_IFIFO)
#define S_ISSOCK(m) (((m) & S_IFMT) == S_IFSOCK) 
```

## 设置用户ID和设置组ID

与进程相关的用户ID和组ID:
* 实际用户ID和实际组ID标识我们究竟是谁。这两个字段的内容取自口令文件的登录项。
* 有效用户ID和有效组ID以及附加组ID决定了我们的文件访问权限。
* 保存的设置用户ID和保存的设置组ID包含了有效用户ID和有效组ID的副本，参见8.1节 setuid 函数

通常，有效用户ID等于实际用户ID，有效组ID等于实际组ID。

当被执行的文件，表示其文件类型信息的stat->st_mode被设置了 S_ISUID 和 S_ISGID 两个标记时，进程的有效用户ID将被设置为文件所有者的用户ID，有效组ID将被设置为文件的组所有者ID

一个典型的场景就是passwd命令，任一普通用户都有修改其口令的权限，但是口令文件（/etc/passwd 和 /etc/shadow）只有超级管理员权限才可以读写，这就存在矛盾了。passwd命令通过设置文件的SUID属性，使用用户在执行其期间具有了短暂的root权限。


**安全问题**
设置了SUID属性的可执行文件，会使执行文件的用户具有与文件拥有者同等的权限。当一些文件拥有者为root的可执行文件设置了SUID属性时，如果其存在漏洞，则可被用于提升用户权限。

## 文件访问权限

代表文件访问权限的标记位：

```c
/* File mode */
/* Read, write, execute/search by owner */
#define	S_IRWXU		0000700		/* [XSI] RWX mask for owner */
#define	S_IRUSR		0000400		/* [XSI] R for owner */
#define	S_IWUSR		0000200		/* [XSI] W for owner */
#define	S_IXUSR		0000100		/* [XSI] X for owner */
/* Read, write, execute/search by group */
#define	S_IRWXG		0000070		/* [XSI] RWX mask for group */
#define	S_IRGRP		0000040		/* [XSI] R for group */
#define	S_IWGRP		0000020		/* [XSI] W for group */
#define	S_IXGRP		0000010		/* [XSI] X for group */
/* Read, write, execute/search by others */
#define	S_IRWXO		0000007		/* [XSI] RWX mask for other */
#define	S_IROTH		0000004		/* [XSI] R for other */
#define	S_IWOTH		0000002		/* [XSI] W for other */
#define	S_IXOTH		0000001		/* [XSI] X for other */
```

chmod 命令可用于修改文件的访问权限。

当用名字打开一个文件时，对该名字包含的每一级目录，包括可能隐含的当前目录，都应具有可执行权限。对于目录，其执行权限位常被称为搜索位。

* 文件的读权限决定了能否打开该文件进行读操作，这与open函数的O_RDONLY和O_RDWR标志相关.
* 文件的写权限决定了能否打开该文件进行写操作，这与open函数的O_WRONLY和O_RDWR标志相关.
* 在open函数中对一个文件指定O_TRUNC标志时，必须具有对该文件的写权限。
* 在一个目录创建文件时，必须具有对该目录的写权限和执行权限。
* 在删除一个文件时，必须对包含该文件的目录具有写权限和执行权限，对文件本身不要求写权限和读权限。
* 使用exec函数执行一个文件时，文件必须具有可执行权限，同时必须是一个普通文件。 

内核对文件访问权限的测试：

1. 若进程的有效用户ID为0，即具有**超级用户**权限，则允许访问。
2. 若进程的有效用户ID等于文件所有者ID，如果所有者对应的访问权限位被设置，则允许访问，否则拒绝访问。
3. 若进程的有效组ID或附加组ID等于文件的组ID，则如果组对应的访问权限位被设置，则允许访问，否则拒绝访问。
4. 若其他用户的访问权限位被设置，则允许访问，否则拒绝访问。

以上第二步和第三步发生拒绝时，不再继续后续判断步骤。

## 新文件和目录的所有权

open 和 create 函数可以创建文件, mkdir 函数可以创建目录。新建文件和新建目录的所有权规则是一致的。

文件的所有者ID是创建文件的进程的有效用户ID。
文件的组ID可以是创建文件的进程的有效组ID，也可以是文件所在目录的组ID。

> **FreeBSD 8.0** and **Mac OS X 10.6.8** always copy the new file’s group ID from the directory.
> **Several Linux** file systems allow the choice between the two options to be selected using a **mount(1)** command option. 
> The default behavior for **Linux 3.2.0** and **Solaris 10** is to determine the group ID of a new file depending on whether the *set-group-ID bit* is set for the directory in which the file is created. If this bit is set, the new file’s group ID is copied from the directory; otherwise, the new file’s group ID is set to the effective group ID of the process.

## access & faccessat

打开一个文件时，系统内核会检查有效用户ID和有效组ID对文件的访问权限。有时，进程需要检查实际用户ID和实际组ID代表的用户对文件的访问权限。当进程文件的嗯SUID标记被设置后，执行进程的用户与进程运行时的有效用户会不一致，进程需要检查执行进程的用户对某文件的访问权限时，即是这种场景。

```c
#include <unistd.h>
int access(const char *pathname, int mode);
int faccessat(int fd, const char *pathname, int mode, int flag);	
		//  Both return: 0 if OK, −1 on error
```

参数mode为F_OK时，用于检查文件是否存在；为R_OK, W_OK, X_OK的组合时，检查具体权限。
当pathname为绝对路劲时，或fd为AT_FDCWD, pathname为相对路径时，faccessat 和 access 相同。
当flag参数传入为AT_EACCESS时，faccessat 检查的是有效用户ID和组ID对文件的访问权限。

## umask

```c
#include <sys/stat.h> 
mode_t umask(mode_t cmask);
		//	Returns: previous file mode creation mask
```

umask 文件模式创建屏蔽字，用来在创建文件时，屏蔽指定的访问权限位。
可设置的值可取如下值的组合：

| Mask bit | Meaning |
| --- | --- |
| 0400 | prevent user from reading your files |
| 0200 | prevent user from writing your files |
| 0100 | prevent user from executing your files |
| 0040 | prevent group members from reading your files |
| 0020 | prevent group members from writing your files |
| 0010 | prevent group members from executing your files |
| 0004 | prevent others from reading your files |
| 0002 | prevent others from writing your files |
| 0001 | prevent others from executing your files |

> eg. Some common umask values are 002 to prevent others from writing your files, 022 to prevent group members and others from writing your files, and 027 to prevent group members from writing your files and others from reading, writing, or executing your files.

进程内设置mask值时，不会影响其父进程的mask值。

## chmod, fchmod, fchmodat

```c
#include <sys/stat.h>
int chmod(const char *pathname, mode_t mode);
int fchmod(int fd, mode_t mode);
int fchmodat(int fd, const char *pathname, mode_t mode, int flag);
		// All three return: 0 if OK, −1 on error
```

修改文件的访问权限，进程的有效用户ID必须和文件的所有者ID一致或者进程具有超级用户权限。

对于fchmodat函数，pathname可以是绝对路径，可以是相对于fd的相对路径，flag值为AT_SYMLINK_NOFOLLOW时，不会影响被链接的文件。

mode | Description
--- | ---
S_ISUID | set-user-ID on execution
S_ISGID | set-group-ID on execution
S_ISVTX | saved-text (sticky bit)
S_IRWXU | read, write, and execute by user (owner) 
   S_IRUSR | read by user (owner)
   S_IWUSR | write by user (owner)
   S_IXUSR | execute by user (owner)
S_IRWXG | read, write, and execute by group 
   S_IRGRP | read by group
   S_IWGRP | write by group
   S_IXGRP | execute by group
S_IRWXO | read, write, and execute by other (world) 
   S_IROTH | read by other (world)
   S_IWOTH | write by other (world)
   S_IXOTH | execute by other (world)

* 没有超级权限时，对黏住位(S_ISVTX)的设置会被自动关闭。
* 新文件的组ID不等于进程有效组ID和附加组ID中的一个，且进程不具有超级权限时，设置组ID位将会被自动关闭。

## 黏住位

在UNIX系统未使用分页技术时，使用黏住位(S_ISVTX)，可以在进程执行结束后，将可执行文件的副本保存在交换区，方便下载执行该进程时能迅速载入内存。
交换区占用连续磁盘空间，且其中的可执行文件副本也是连续存放，所以比普通磁盘文件加载速度要快些。
滥用黏住位可能会导致交换区别大量占用。
目前的UNIX系统都配置有虚拟内存系统和快速文件系统，黏住位技术已经淘汰。

现在的系统改变了黏住位的功能。Single UNIX Specification 允许的对目录设置黏住位，若如此，只有对该目录具有写权限的用户满足以下条件之一的，才能删除或更名目录下的文件：
	* 拥有此文件
	* 拥有此目录
	* 是超级用户

## chown,  fchown, fchownat, lchown

```c
#include <unistd.h>
int chown(const char *pathname, uid_t owner, gid_t group);
int fchown(int fd, uid_t owner, gid_t group);
int fchownat(int fd, const char *pathname, uid_t owner, gid_t group, int flag);
int lchown(const char *pathname, uid_t owner, gid_t group);
		// All four return: 0 if OK, −1 on error
```

修改文件的userid和groupid, owner和group参数传入-1时，表示不修改当前值。
对于链接文件，lchown和fchownat(在flag为AT_SYMLINK_NOFOLLOW时)，只作用于链接文件本身，不影响链接所指文件。

## 文件大小

stat 结构中的 st_size 字段表示以字节为单位的文件长度。
普通文件长度可以未0。
目录文件通常是一个数（16或512）的倍数。
符号链接，文件长度是文件名的实际字节数。

## 文件截断

```c
#include <unistd.h>
int truncate(const char *pathname, off_t length); 
int ftruncate(int fd, off_t length);
		// Both return: 0 if OK, −1 on error
```

> These two functions truncate an existing file to length bytes. 
> If the previous size of the file was greater than length, the data beyond length is no longer accessible. 
> Otherwise, if the previous size was less than length, the file size will increase and the data between the old end of file and the new end of file will read as 0 











