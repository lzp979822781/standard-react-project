# react框架

## 概述
### 介绍
```
umi，中文可发音为乌米，是一个可插拔的企业级 react 应用框架。umi 以路由为基础的，支持类 next.js 的约定式路由，以及各种进阶的路由功能，并以此进行功能扩展，比如支持路由级的按需加载。然后配以完善的插件体系，覆盖从源码到构建产物的每个生命周期，支持各种功能扩展和业务需求，目前内外部加起来已有 50+ 的插件。
```
### 特性
* 开箱即用，内置 react、react-router 等
* 支持约定式、配置式路由
* 完善的插件体系，覆盖从源码到构建产物的每个生命周期
* 高性能，通过插件支持 PWA、以路由为单元的 code splitting
* 支持静态页面导出
* 开发启动快 支持一键开启dll等
* 一键兼容到 IE9，基于 umi-plugin-polyfills
* 与 dva 数据流的深入融合，支持 duck directory、model 的自动加载、code splitting 等等


## 架构
![Image text](https://gw.alipayobjects.com/zos/rmsportal/zvfEXesXdgTzWYZCuHLe.png)



## 规范

### 项目整体目录结构
```
|-- standard-project
    |-- .editorconfig           // 配置编辑器
    |-- .eslintrc.js            // eslint配置文件
    |-- .prettierrc             // 格式美化
    |-- .stylelintrc.json       
    |-- LICENSE
    |-- jsconfig.json
    |-- package.json            // 工程包管理文件
    |-- tsconfig.json
    |-- tslint.json
    |-- config
    |   |-- config.js           // 工程配置文件
    |   |-- plugin.config.js    // 插件配置
    |   |-- router.config.js    // 路由配置
    |   |-- theme.config.js     // 主题配置
    |-- public                  // 全局资源
    |-- scripts                 // 脚本资源
    |-- src                     
    |   |-- assets              // 公共资源
    |   |-- components          // 公共组件
    |   |-- layouts             // 布局文件
    |   |-- locales             // 语言包
    |   |-- models              // 全局数据模型
    |   |-- pages               // 开发者目录
    |   |   |-- home            // 节点名称可多层嵌套
    |   |   |   |-- components  // 节点组件
    |   |   |   |-- models      // 节点内数据模型
    |   |   |   |-- services    // 节点服务层
    |   |-- services            // 全局服务请求层
    |   |-- utils               // 工具类文件夹
```




### 功能节点目录结构
```
|-- home            // 节点名称可多层嵌套
|   |-- components  // 节点组件
|   |-- models      // 节点内数据模型
|   |-- services    // 节点服务层
```

### 命名规范

* 文件夹命名规范

 按功能作用来区分，普通文件夹(web-test)、组件类文件夹（名称大驼峰 WebTest）、

* 文件命名规规范
    文件命名同文件夹规范

### 注释规范
    参考 http://www.dba.cn/book/jsdoc/

### 开发规范
*   格式：按照划分的目录结构进行项目不同组件、model、service的开发，具体文件中各种规范通过eslint进行验证

*   js: key的使用、生命周期函数的正常使用（componentDidMount）、对this变量及深层次对象访问的及时缓存等等（了解作用域链）

*   css: 使用less定义命名空间、合理使用mixin(了解mixin中 .mixin和.mixin()的编译后区别)

## 简单事例

### 开发
#### 启动服务
```
    在package.json中的scripts标签中查找启动命令，一般是start或者dev
    npm run start 或者 npm run dev
```
#### 创建节点
```
    在src/pages新建节点test
    |-- test
    |   |-- components
    |   |   |-- Hello
    |   |       |-- index.js
    |   |       |-- index.less
    |   |-- models
    |   |   |-- hello.js
    |   |-- services
    |   |   |-- hello.js
```
#### 创建组件 

&emsp;&emsp;如上图所示,在 src/pages/test下创建components文件夹，所有的组件都在此文件夹下,上图我们创建的是Hello组件，默认组件内部文件js、css文件均以index命名
&emsp;&emsp;index.js代码如下
```
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import styles from './index.less';

let dispatch;

@connect(state => state.hello)
class Hello extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        // eslint-disable-next-line prefer-destructuring
        dispatch = props.dispatch;
    }

    getHelloInfo = () => {

        dispatch({
            type: 'hello/getHelloInfo',
            payload: {},
        })
    }

    render() {
        const { msg } = this.props;
        return (
            <div className = {styles.hello}>
                <p>{msg}</p>
                <Button type = "primary" onClick = {this.getHelloInfo}>点击切换文本</Button>
            </div>
        );
    }
}

export default Hello;
```
&emsp;&emsp;index.css代码如下
```
.hello {
    width: 100%;
    height: 100%;
}
```
#### 创建数据模型

&emsp;&emsp;在src/pages/test下创建models文件夹，在此文件夹内创建hello.js,作为数据模型文件,文件中导出一个json, 代码如下
```
// import moment from 'moment';
import {
    getHelloInfo
} from '../services/hello';

export default {
    namespace: 'hello',

    state: {
        msg: 'helloword'
    },

    effects: {

        *getHelloInfo({ payload }, { call, put }) {
            const res = yield call(getHelloInfo, payload);
            if(res && res.success) {
                const { data: { msg } } = res;
                yield put({
                    type: 'updateState',
                    payload: {
                        msg
                    }
                })
            }
        },


    },

    reducers: {
        updateState(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        }
    },
};

```
&emsp;&emsp;payload为dispatch传递的payload参数，call、put方法为dva框架中的方法，实际dva框架是基于redux-sage封装，所以查看API可以直接查看redux-sage
call方法用于调用service方法
put用于在model模型内更新model中的state值使用

#### 创建服务请求

&emsp;&emsp;在models的同级目录创建services文件夹，在此文件夹内同样创建hello.js作为服务请求文件，实际开发中代码如下：

URL定义:
```
import request from '@/utils/request';

const URL = {
    'GET_SYS': '/web/sys/list', // 获取系统列表
    'GET_PUBLISH_DETAIL': '/web/release/detail', // 查询发布详情
}
```


post请求:
```
export function getSysInfo(param) {
    return request( URL.GET_SYS, {
        method: 'post',
        data: param,
    })
}
```
get请求:
```
export function getPublishDetail(param) {
    return request( URL.GET_PUBLISH_DETAIL, {
        method: 'GET',
        params: param
    })
}
```

此简单事例中我们使用Promise模拟一个请求返回值，代码如下
```
export function getHelloInfo() {
    return new Promise((resolve) => {
        resolve({ data: { msg: "service hello" }, success: true })
    }).then(res => res)
}

```

#### 配置代理 
```
    在config.js中配置proxy选项，其中options中的配置项说明
    secure： 为true表示开启HTTPS验证,为false则不启用
    changeOrigin: 修改目标URL header中的origin 项,通常为了解决跨域问题
```

### 调试
* chrome中安装 React Devtools、Redux DevTools插件

### 打包
* 运行命令 npm run build 
* 注意config.js 中base、publicPath的配置,其中base为router访问的基路径，publicPath为公共资源的访问路径

### 部署
参考note.jd.com 共享文档，重点在于host文件的配置

## 常见问题

### 开发类

* function和箭头函数中this指向的区别

    function指向调用者，this指向当前定义对象

* 路由的跳转及传值

    参考地址 https://umijs.org/zh/api/#umi-link ,其中路由url传参通过query字段，类body传参使用state字段，如下所示
```
    router.push({
        pathname: '/home/sys-state',
        query: {
            groupId: record.id
        },
        state: {
            clusterRecord: record
        }
    })
```

* loading的加载

此套框架中默认集成了loading数据框架，可以针对调用的数据模型的effect来直接获取loading，在connect中获取loading，如下所示
```
@connect(({ home, loading }) => ({
    ...home,
    loading: loading.effects['home/query'],
}))

```


* 同一页面中多form表单的使用
同一页面出现多个form表单域的时候，为了防止系统字段取值和赋值时的干扰，通过函数式组件创建不同的表单域，这样每个组件内使用独立的form属性

* 在Mac下使用sourcetree提交代码，出现如下报错：
```
.git/hooks/pre-commit: line XXX: node: command not found
```
在 https://stackoverflow.com/questions/12881975/git-pre-commit-hook-failing-in-github-for-mac-works-on-command-line
中有问题分析：使用诸如SourceTree这样的gui，可以访问的环境变量不一样，需要在.git/hooks/pre-commit脚本中加入你的node环境变量

* 首先打印你的node目录
```
$ which node
```
比如(每个人的目录都不同)
```
/Users/liuzhipeng26/.nvm/versions/node/v10.16.3/bin/node
```

* 然后将目录加入到 你的git项目下 .git/hooks/pre-commit中
```
PATH="/Users/liuzhipeng26/.nvm/versions/node/v10.16.3/bin:$PATH"
```
### 部署类


## 学习清单

* 基础开发：

    js: 你不知道的JavaScript、高性能JavaScript

    react： https://react.docschina.org/

    ES6： http://es6.ruanyifeng.com/

    JSX： 参考react官网即可

    Less：http://lesscss.cn/

* 数据模型相关 

    redux、react-redux、redux中间件：
    https://www.redux.org.cn/
    
* 路由相关 
  
    react-router：http://react-guide.github.io/react-router-cn/


* 服务请求 axios、fetch

    axios: https://www.kancloud.cn/yunye/axios/234845

    fetch: https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch

* 框架 umi框架

    umi: https://umijs.org/zh/
    
    dva: https://dvajs.com/guide/


## 项目hosts配置

127.0.0.1 yaostatic.jd.com
192.168.132.47 man-yao.jd.com
127.0.0.1 localhost dev.jd.com dev.shop.jd.com