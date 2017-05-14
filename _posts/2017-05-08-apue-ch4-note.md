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

> <p>**FreeBSD 8.0** and **Mac OS X 10.6.8** always copy the new file’s group ID from the directory. </p>
> <p>**Several Linux** file systems allow the choice between the two options to be selected using a **mount(1)** command option. </p>
> <p>The default behavior for **Linux 3.2.0** and **Solaris 10** is to determine the group ID of a new file depending on whether the *set-group-ID bit* is set for the directory in which the file is created. If this bit is set, the new file’s group ID is copied from the directory; otherwise, the new file’s group ID is set to the effective group ID of the process.</p>

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

> <p>These two functions truncate an existing file to length bytes. </p>
> <p>If the previous size of the file was greater than length, the data beyond length is no longer accessible. </p>
> <p>Otherwise, if the previous size was less than length, the file size will increase and the data between the old end of file and the new end of file will read as 0 </p>

## 文件系统

![](../../../../images/filesystem.png)


* 一块硬盘(disk)可以分为多个**分区**(partition)
* 每个分区可以包含一个文件系统(file system)
* 文件系统由**自举块**(boot block)，**超级块**(super block)和若干个**柱面组**(cylinder group)组成
* 一个柱面组由**超级块副本**(super block copy)，**配置信息**(cg info)，**i节点图**(i-node map)，**块位图**(block bitmap)，若干个**i节点块**(i-nodes)和数据块(data blocks)组成

![](../../../../images/i-nodes_and_data_blocks.png)

* 图中两个目录项(directory entry)指向同一个i-node节点，每个i-node节点都一个计数器，记录指向其的目录项数目。
* 当i-node上的计数器变为0时，文件内容才会真正被删除(释放数据块)。
* 这就是为何"unlinking a file"通常并不意味着删除与文件关联的数据块的原因。
* 这也是为何移除目录项被称为unlink而不是delete的原因。
* i-node节点的引用计数器在stat结构中，由st_nlink记录。
* 这种链接方式称为硬链接(hard links)。
* 在符号链接(symbolic links)中，并不公用i-node和data blocks，链接文件的data blocks中记录的被链接文件的路径。
* i-node节点包含关于文件的有信息: 文件类型，访问权限控制位，文件大小，数据块的地址等待。
* 目录项中的i-node编号只能指向同一个文件系统中的i-node，所以`ln`命令不能创建跨文件系统的链接。
* `mv`命令本质上是创建了一个新的目录项并关联在旧的i-node节点上，同时unlink旧的目录项。

![](../../../../images/link_count_field_for_a_directory.png)

* 不含有子目录的目录项，其i-node节点的计数器总是2(被自身和父目录引用）
* 含有子目录的目录项，其i-node节点的计数器器至少为3（2 + 子目录数）

## link, linkat, unlink, unlinkat, and remove Functions

```c
#include <unistd.h>
int link(const char *existingpath, const char *newpath);
int linkat(int efd, const char *existingpath, int nfd, const char *newpath, int flag);
		//	Both return: 0 if OK, −1 on error
```

这两个函数创建新的目录项，引用existingpath;
对于linkat函数，efd和existingpath指定了已有文件路径，nfd和newpath指定了新的路径名。当两个路径名的任意一个为相对路径时，其路径依据对应的fd计算；当任意一个fd设置为AT_FDCWD时，那么路径名如果是相对路径就以当前目录为基准，如果路径是绝对路径，fd参数将被忽略。
当existingpath是一个符号链接时，如果flag参数为AT_SYMLINK_FOLLOW时，新文件链接到旧符号链接所指的文件，否则链接到旧符号链接文件。

创建新的目录项和增加引用计数器必须是一个原子操作。

```c
#include <unistd.h>
int unlink(const char *pathname);
int unlinkat(int fd, const char *pathname, int flag);
		//	Both return: 0 if OK, −1 on error
```

这两个函数删除目录项并递减引用计数器。
调用这两个函数，必须对文件所在目录拥有写权限和执行权限。如果目录设置了黏住位，还需要满足如下条件之一：1)拥有该文件，2)拥有该目录，3)拥有超级权限。
当文件的引用计数器递减为0，并且同时没有其他进程打开该文件，系统将会删除该文件的内容。
对于unlinkat，当参数flag的值为AT_REMOVEDIR时，函数的作用与rmdir一样。

对于临时文件，通常可以在创建后立即unlink，可以防止进程崩溃时文件未能删除。
对于符号链接，unlink只能删除符号链接，而不能直接删除链接所指文件。

remove函数具有和unlink函数，rmdir函数同样的功能。

```c
nclude <stdio.h>
int remove(const char *pathname);
		// Returns: 0 if OK, −1 on error
```

## rename, renameat

```c
#include <stdio.h>
int rename(const char *oldname, const char *newname);
int renameat(int oldfd, const char *oldname, int newfd, const char *newname);
		//	Both return: 0 if OK, −1 on error
```

* 如果oldname所指的是一个文件而不是目录，这种情况下，如果newname已存在，则其不能为目录。rename的实际操作是删除newname所指的文件，将oldname所指的文件重命名为newname。此操作必须对newname和oldname所在的目录具有写操作权限。
* 如果oldname所指的是一个目录，这种情况下，如果newname已存在，则其必须为目录，其必须为空目录。rename的实际操作是，删除newname所指的目录，将oldname所指的目录重名为newname。此外，newname不能是oldname的子目录。
* 如果oldname或newname是符号链接，rename只影响链接本身，不影响链接所指的文件。
* rename不能作用于`.`和`..`目录
* 当newname和oldname为同一个值时，rename函数不做任何事，同时返回成功。
* 对于renameat函数，flag可取值AT_FDCWD，行为与其他函数类似。

## 符号链接

硬链接存在以下限制：
* 不能跨文件系统
* 对于支持创建目录的硬链接的文件系统，此操作一般也需要超级用户权限。

符号链接不存在以上限制。

函数在处理符号链接文件时，可能是处理符号链接文件本身，也可能是处理符号链接所指的文件。
本章提到的函数，在处理路径名参数时，是否跟随符号链接的情况如下表：

Function | Does not follow symbolic link | Follows symbolic link
--- | --- | ---
ccess |  | •
chdir |  | •
chmod |  | •
chown |  | •
creat |  | •
exec |  | •
lchown | • | 
link |  | •
lstat | • | 
open |  | •
opendir |  | •
pathconf |  | •
readlink | • | 
remove | • | 
rename | • | 
stat |  | •
truncate |  | •
unlink | • | 

允许对目录创建链接时，会引入路径循环的问题。如下一组命令：

```shell
mkdir foo					# make a new directory
touch foo/a					# create a 0-length file 
ln -s ../foo foo/testdir	# create a symbolic link
ls -l foo
```

>total 0<br>
-rw-r----- 1 sar 0 Jan 22 00:16 a<br>
lrwxrwxrwx 1 sar 6 Jan 22 00:16 testdir -> ../foo

当使用`ftw`命令遍历foo目录下的文件时，则会出现 "foo/testdir/testdir/testdir/.../a" 的情况，直到命令报出ELOOP错误才能停止。
出现这种情况时，符号链接可以用unlink命令解决，硬链接就很麻烦了。所以一般文件系统不支持对目录创建硬链接。

`ls -F`命令在显示符号链接文件时，会在文件名末尾补一个@符号。

## 创建和读取符号链接文件

创建符号链接文件使用symlink和symlinkat函数

```c
#include <unistd.h>
int symlink(const char *actualpath, const char *sympath);
int symlinkat(const char *actualpath, int fd, const char *sympath);
		//	Both return: 0 if OK, −1 on error
```

fd的值为AT_FDCWD时，symlinkat和symlink的作用一样。

符号链接文件直接使用open命令打开时，打开的是链接所指的文件。读取链接文件自身的内容有个单独的函数。

```c
#include <unistd.h>
ssize_t readlink(const char* restrict pathname, char *restrict buf,
			size_t bufsize);
ssize_t readlinkat(int fd, const char* restrict pathname,
			char *restrict buf, size_t bufsize);
		//	Both return: number of bytes read if OK, −1 on error
```

注意，读取到的结果，buf中是一个不以null字符结尾的字符串，需要结合函数返回值确定读取到的内容的长度。

## 文件时间

stat结构体中有三个字段表示文件的三个时间值。

Field | Description | Example | ls(1) option
--- | --- | --- | ---
st_atim	| last-access time of file data | read | -u
st_mtim	| last-modification time of file data | write | default
st_ctim | last-change time of i-node status | chmod, chown | -c

>The modification time indicates when the contents of the file were last modified. <br>
>The changed-status time indicates when the i-node of the file was last modified.

![](images/filetimes.png)

## futimens, utimensat, utimes

```c
#include <sys/stat.h>
int futimens(int fd, const struct timespec times[2]);
int utimensat(int fd, const char *path, const struct timespec times[2], int flag);
		//	Both return: 0 if OK, −1 on error
```

```c
struct timespec {
	__kernel_time_t	tv_sec;			/* seconds */
	long		tv_nsec;			/* nanoseconds */
};
```

这两个函数可用于修改文件的最后访问时间和最后修改时间。
times数组的第一个值为访问时间，第二个值为修改时间。
* 如果times为NULL, 则两个时间戳均被修改为当前时间;
* 如果times表示的访问时间和修改时间任意一个的tv_nsec域设置为UTIME_NOW，则相应的时间戳设置为当前时间，相应的tv_sec域被忽略。
* 如果times表示的访问时间和修改时间任意一个的tv_nsec域设置为UTIME_OMIT，则相应的时间戳不变，相应的tv_sec域被忽略。
* 如果tv_nsec的值既不是UTIME_NOW，也不是UTIME_OMIT，则相应的时间由tv_nsec和tv_sec共同决定。

对权限的要求：
* times为空，或者tv_nsec为UTIME_NOW，需要进程的有效ID为文件的拥有者ID且进程拥有对文件的写权限，或者进程为超级用户权限。
* times不为空，且tv_nsec不为UTIME_NOW和UTIME_OMIT，需要进程的有效ID为文件的拥有者ID，或者进程为超级用户权限，不需要进程拥有对文件的写权限。
* 如果times不为空，且两个成员的tv_nsec均为UTIME_OMIT，则没有任何修改发生，不需要权限检查。

futimens 和 utimensat 是POSIX.1的引入的。XSI 定义了具有同样功能的函数utimes

```c
#include <sys/time.h>
int utimes(const char *pathname, const struct timeval times[2]);
		//	Returns: 0 if OK, −1 on error.
```

```c
struct timeval {
	time_t tv_sec;    /* seconds */
	long   tv_usec;   /* microseconds */
};
```

## mkdir, mkdirat, rmdir

```c
#include <sys/stat.h>
int mkdir(const char *pathname, mode_t mode);
int mkdirat(int fd, const char *pathname, mode_t mode);
		//	Both return: 0 if OK, −1 on error
```

如果fd的值为AT_FDCWD，或者pathname为绝对路径时，mkdirat和mkdir行为一致。

```c
#include <unistd.h>
int rmdir(const char *pathname);
		//	Returns: 0 if OK, −1 on error
```

## 读目录

对目录具有访问权限的任何用户都可以读目录，只有内核可以写目录；目录的写权限位和执行权限位决定了在该目录中能否创建文件和删除文件，而不是写目录文件本身。

目录的实际格式与系统实现密切相关，UNIX系统屏蔽了使用read函数读目录文件，提供了一组专用接口(属于POSIX.1)，从而实现将应用程序与目录格式中的实现细节相隔离。

```c
#include <dirent.h>
DIR *opendir(const char *pathname); 
DIR *fdopendir(int fd);
		//	Both return: pointer if OK, NULL on error 
struct dirent *readdir(DIR *dp); 
		//	Returns: pointer if OK, NULL at end of directory or error
void rewinddir(DIR *dp);
int closedir(DIR *dp);
		//	Returns: 0 if OK, −1 on error 
long telldir(DIR *dp);
		//	Returns: current location in directory associated with dp
void seekdir(DIR *dp, long loc);
```

telldir和seekdir不属于POSIX.1，他们属于XSI扩展。

目录中目录项的顺序与系统实现有关，通常不是按字母序排序。fdopendir返回的DIR，其中被readdir读取到的第一个项是与传给fdopendir的文件描述符的偏移有关。

[p4_7.c](p4_7.c)

## chdir, fchdir, getcwd

```c
#include <unistd.h>
int chdir(const char *pathname); int fchdir(int fd);
		//	Both return: 0 if OK, −1 on error
```

```c
#include <unistd.h>
char *getcwd(char *buf, size_t size);
		//	Returns: buf if OK, NULL on error
```

## 设备特殊文件

stat 结构中的字段st_dev和st_rdev表示设备号，只有字符特殊文件和块特殊文件才有st_rdev的值。此值包含实际设备的设备号。

## 文件访问权限位总结

Constant | Description | Effect on regular file | Effect on directory
--- | --- | --- | ---
S_ISUID | set-user-ID |	set effective user ID on execution | (not used) 
S_ISGID | set-group-ID | if group-execute set, then set effective group ID on execution; otherwise, enable mandatory record locking (if supported) | set group ID of new files created in directory to group ID of directory 
S_ISVTX | sticky bit | control caching of file contents (if supported) | restrict removal and renaming of files in director| 
S_IRUSR | user-read | user permission to read file | user permission to read directory entries 
S_IWUSR | user-write | user permission to write file | user permission to remove and create files in directory 
S_IXUSR | user-execute | user permission to execute file | user permission to search for given pathname in directory 
S_IRGRP | group-read | group permission to read file | group permission to read directory entries 
S_IWGRP | group-write | group permission to write file | group permission to remove and create files in directory 
S_IXGRP | group-execute | group permission to execute file | group permission to search for given pathname in directory 
S_IROTH | other-read | other permission to read file | other permission to read directory entries 
S_IWOTH | other-write | other permission to write file | other permission to remove and create files in directory 
S_IXOTH | other-execute | other permission to execute file | other permission to search for given pathname in directory 

The final nine constants can also be grouped into threes, as follows:<br>
          S_IRWXU = S_IRUSR | S_IWUSR | S_IXUSR<br>
          S_IRWXG = S_IRGRP | S_IWGRP | S_IXGRP<br>
          S_IRWXO = S_IROTH | S_IWOTH | S_IXOTH<br>
