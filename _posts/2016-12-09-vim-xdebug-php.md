---
layout: post
title: Vim + XDebug 调试 PHP 
date: 2016-12-9
---


# 环境

```
ubuntu 16.04
Vim 7.4
odp 3.0.2
  php 5.4
  nginx 1.4.4
  XDebug.so 2.1.0.5
```

# 安装

## 编译及安装Vim
  ubuntu 自带的Vim不带python解释器（16.04带python3.0的解释器，不带2.0的解释器），XDebug插件是python脚本开发，需要Vim支持python2.0的解释器。
  检查Vim是否支持python解释器：
  >$ vim --version | grep python
+cryptv          +linebreak       ***-python***          +vreplace
+cscope          +lispindent      +python3         +wildignore
Linking: gcc   -Wl,-Bsymbolic-functions -fPIE -pie -Wl,-z,relro -Wl,-z,now -Wl,--as-needed -o vim        -lm -ltinfo -lnsl  -lselinux  -lacl -lattr -lgpm -ldl     -L/usr/lib/python3.5/config-3.5m-x86_64-linux-gnu -lpython3.5m -lpthread -ldl -lutil -lm

>$ myvim --version | grep python
+cryptv          +linebreak       ***+python***          +viminfo
+cscope          +lispindent      -python3         +vreplace
Linking: gcc   -L/usr/local/lib -Wl,--as-needed -o vim        -lm -lncurses -lnsl   -ldl    -L/usr/lib/python2.7/config-x86_64-linux-gnu -lpython2.7 -lpthread -ldl -lutil -lm -Xlinker -export-dynamic -Wl,-O1 -Wl,-Bsymbolic-functions
  
### 编译及安装依赖库 [ncurses](https://zh.wikipedia.org/wiki/Ncurses)
  
  * [下载地址](http://ftp.gnu.org/pub/gnu/ncurses/ncurses-5.9.tar.gz)
  * 编译及安装
    ```text
    $ tar -xf ncurses-5.9.tar.gz
    $ cd ncurses-5.9
    $ ./configure
    $ make
    $ sudo make install
    ```
    
### 编译及安装

  * 下载Vim源码:
    `ftp://ftp.vim.org/pub/vim/unix/vim-7.4.tar.bz2    // Vim 7.4, 最新8.0版本已出`
  * 编译及安装
  ```text
  $ tar -xf  vim-7.4.tar.bz2
  $ cd vim74
  $ ./configure     \
      --prefix=/usr/${installpath}  \ 
      --with-features=huge    \
      --enable-pythoninterp   \
      --with-python-config-dir=/usr/lib/python2.7/config-i386-linux-gnu/
  $ sudo make
  $ sudo make install
  ```
  

## Vim安装XDebug客户端插件[vim-xdebug](https://github.com/joonty/vim-xdebug)
  vim-xdebug 是安装起来最方便的XDebug客户端插件。
  该插件的github页已提示不再维护，而是转入更强大的[Vdebug](https://github.com/joonty/vdebug)（支持多种语言），以后再折腾。
  插件安装 (使用Vundle安装)：
  > 在~/.vimrc 中添加 `Plguin 'joonty/vdebug'`
  命令行里运行： `vim +PluginInstall +qall`

# 配置
  ## php.ini
  ```ini
  [xdebug]
zend_extension='path_oh_php_ext/xdebug.so'
xdebug.remote_enable=on
xdebug.remote_handler=dbgp
xdebug.remote_host=localhost
xdebug.remote_port=9000
  ```
  ## vim-xdebug
  add in vimrc `let g:debuggerPort = 9000`
  
  当9000端口被占用时，可修改端口号，两处要同时修改，改完切记重启php-fpm
  
# 调试
  * 光标所在行下断点 `:Bp`
  * 等待连接 `F5`
  * 浏览器url尾部加?XDEBUG_SESSION_START=1后请求
  * 断点断住，单步
    * `F2` Setp Into
    * `F3` Setp Over
    * `F4` Setp Out
    * `F5` run
    * `F6` quit debugging
  * 其他调试技巧
    * `F11` get all context
    * `F12` get property at cursor
    * `F1` resize
    * `:Up`	stack up
    * `:DN`	stack down

# Chrome插件
  * **Xdebug helper**，开启后自动在请求url尾部添加调试标记
  * **DHC - Restlet Client**， REST & HTTP API developer's pocket knife. Easy to use and configurable. HATEOAS, Hypermedia, Requests History+Repository, and more


