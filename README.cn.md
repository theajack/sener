<!--
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
-->
# [Sener](https://github.com/theajack/sener)

<p align="left">
    <a href="https://www.github.com/theajack/sener/stargazers" target="_black">
        <img src="https://img.shields.io/github/stars/theajack/sener?logo=github" alt="stars" />
    </a>
    <a href="https://www.github.com/theajack/sener/network/members" target="_black">
        <img src="https://img.shields.io/github/forks/theajack/sener?logo=github" alt="forks" />
    </a>
    <a href="https://www.npmjs.com/package/sener" target="_black">
        <img src="https://img.shields.io/npm/v/sener?logo=npm" alt="version" />
    </a>
    <a href="https://www.npmjs.com/package/sener" target="_black">
        <img src="https://img.shields.io/npm/dm/sener?color=%23ffca28&logo=npm" alt="downloads" />
    </a>
    <a href="https://www.jsdelivr.com/package/npm/sener" target="_black">
        <img src="https://data.jsdelivr.com/v1/package/npm/sener/badge" alt="jsdelivr" />
    </a>
</p>

<p align="left">
    <a href="https://github.com/theajack" target="_black">
        <img src="https://img.shields.io/badge/Author-%20theajack%20-7289da.svg?&logo=github" alt="author" />
    </a>
    <a href="https://www.github.com/theajack/sener/blob/master/LICENSE" target="_black">
        <img src="https://img.shields.io/github/license/theajack/sener?color=%232DCE89&logo=github" alt="license" />
    </a>
    <a href="https://fastly.jsdelivr.net/gh/theajack/sener/dist/sener.latest.min.js"><img src="https://img.shields.io/bundlephobia/minzip/sener.svg" alt="Size"></a>
    <a href="https://github.com/theajack/sener/search?l=javascript"><img src="https://img.shields.io/github/languages/top/theajack/sener.svg" alt="TopLang"></a>
    <a href="https://github.com/theajack/sener/issues"><img src="https://img.shields.io/github/issues-closed/theajack/sener.svg" alt="issue"></a>
    <a href="https://www.github.com/theajack/sener"><img src="https://img.shields.io/librariesio/dependent-repos/npm/sener.svg" alt="Dependent"></a>
</p>

<h3>🚀 简单易用、功能强大、高可扩展的nodejs http服务器</h3>

**[English](https://github.com/theajack/sener) | [更新日志](https://github.com/theajack/cnchar/blob/master/scripts/version.cn.md) | [反馈](https://github.com/theajack/sener/issues/new) | [Gitee](https://gitee.com/theajack/sener) | [留言板](https://theajack.github.io/message-board/?app=sener)**

文档持续完善中

## 1. 特性

1. 简单高效的架构，全ts编写，高度友好的ts声明支持
2. 支持高度自定义的中间件体系
3. 内置router中间件
4. json中间件：支持json文件用于数据存储
5. cors中间件：支持跨域请求
6. static中间件：支持静态文件目录
7. form中间件：支持formdata解析和文件上传
8. config中间件：支持高度灵活的参数配置和动态变更与监听
9. log中间件：支持灵活的日志体系，支持日志级别控制
10. mysql中间件：支持mysql连接
11. mongodb中间件：支持mongodb连接

## 2. 基础使用

```
npm i sener
```

最简demo:

```js
import {Sener} from 'sener';
new Sener();
```

options:

```js
new Sener({
  port: 9000, // port: default value is 9000
  middlewares: [], // Sener middlewares
});
```

Sener 将所有文件存储在 sener-data 文件夹中

在开发环境中，根目录是执行当前cmd的目录，在生产环境中，根目录是homedir。


```js
const BASE_SENER_DIR = path.resolve(
    `${IS_DEV ? process.cwd() : homedir()}`,
    `./sener-data`
);
```


## 3. 中间件

### 3.1 router

路由中间件

```js
import {Sener, Router} from 'sener';
const router = new Router({
    '/demo': ({ query }) => {
        query.message = 'from get';
        return { data: query };
    },
    'post:/demo': async ({ body }) => {
        body.message = 'from post'
        return { data: body };
    },
});
new Sener({
  middlewares: [router],
});
```

### 3.2 json

使用json文件进行数据存储

```
npm i sener sener-json
```

```js
import {Sener, Router} from 'sener';
import {Json} from 'sener-json';
const router = new Router({
    '/data': ({ query, read }) => {
        // 'data' is json file name
        return { data: read('data') };
    },
    'post:/data': async ({ body, write }) => {
        const { data, save, id } = write('aa');
        body.message = 'from post'
        data.push({...body, id: id()}); // Add increment id
        save(); // save it, THIS Method must be called
        return { data };
    },
});
new Sener({
  middlewares: [router, new Json()],
});
```

可选参数：

```js
new Json({
  dir: '', // directory for save json files. default value is ''
  format: false, // Whether to format the JSON file. Default value: The development environment is false and the production environment is true
})
```

### 3.3 cors

```
npm i sener sener-cors
```

支持跨域请求的中间件

```js
import {Sener, Cors} from 'sener';
new Sener({
  middlewares: [new Cors()], 
  // new Cors(header); Or Set your custom headers
});
```

可选参数

```js
new Cors({
  // headers: Set your custom headers
})
```

### 3.4 static

支持静态资源的中间件

```
npm i sener sener-static
```

```js
import {Sener} from 'sener';
import {Static} from 'sener-static';
new Sener({
  middlewares: [new Static()], 
  // new Static({dir}); dir default value is ./public
});
```

可选参数：

```js
new Static({
  dir: './public', // Static directory, default value is ./public
})
```

### 3.5 form

支持form表单和文件上传的中间件

```
npm i sener sener-form
```

```js
import {Sener, Router} from 'sener';
import {Form} from 'sener-form';

const router = new Router({
    'post:/upload': ({ formData, files }) => {
        return { formData, files }
    },
});

new Sener({
  middlewares: [new Form(), router], 
  // new Form({dir}); dir default value is ./public
});
```

可选参数

```js
new Form({
  dir: './public/upload', // File upload directory, default value is ./public/upload
})
```

### 3.6 log

支持日志打印和控制的中间件

```
npm i sener sener-log
```

```js
import {Sener, Router} from 'sener';
import {Log} from 'sener-log';

const router = new Router({
    'post:/test': ({ query, logger }) => {
        logger.log('msg', 'payload')
        return { query }
    },
});

new Sener({
  middlewares: [new Log(), router], 
});
```

声明文件

```ts
class Logger {
  log(msg: string | IMessageData, payload?: any, type?: TLogType): void;
  get traceid (): string;
  refreshDurationStart(): void;
  refreshTraceId(): void;
}

interface IMessageData {
  msg?: string;
  payload?: any;
  type?: 'error' | 'log' | 'warn' | 'info';
  level?: number;
  extend?: object;
}
```

可选参数

```js
new Log({
  dir: ''， // 存储日志文件的目录。默认值为“”，使用根目录
  useConsole: false, // 是否启用控制台.log服务运行时打印日志。不建议打开生产环境。默认值为 false
  maxRecords: 10000, // 单个日志文件的最大存储记录数，默认值为 10000
  level: -1, // 日志打印级别，级别小于此数字的日志将不打印
  // level?: ()=>number // 级别也可以是一种动态获取级别值的方法，通常与配置中间件结合使用
})
```

### 3.7 config

支持灵活使用 JSON 配置文件的中间件

```
npm i sener sener-config
```

```js
import {Sener, Router} from 'sener';
import {Config} from 'sener-config';

const router = new Router({
    'post:/test': ({ query, config, writeConfig, onConfigChange }) => {
        const level = config.level;
        level(); // read config
        level(5); // write config
        writeConfig('level', 5) // write config with writeConfig
        onConfigChange(({key, value, prev}) => { // on config change
            console.log(key, value, prev);
        })
        return { query }
    },
});

const config = new Config();

// Use config instance

config.onConfigChange(({key, value, prev}) => { // on config change
    console.log(key, value, prev);
});

config.data.level(); // read config

config.data.level(5); // write config

config.writeConfig('level', 2); // write config with writeConfig

new Sener({
  middlewares: [config, router], 
});
```

options

```ts
new Config({
  dir: '', // 用于保存配置文件的目录。默认值为“”
  file: 'default', // 配置文件的文件名。默认值为“默认值”
  // file: ['c1', 'c2'],  // 传入数组表示使用了多个配置文件
  format: false, // 是否格式化 JSON 文件。默认值：开发环境为假，生产环境为真
})
```

### 3.8 mysql

支持mysql连接的中间件

```
npm i sener sener-mysql
```

```js
import {Sener, Router} from 'sener';
import {Mysql} from 'sener-mysql';

const router = new Router({
    'post:/test': async ({ query, querySql, mysqlConn }) => {
        const { results, fields } = await querySql('select * from user');
        // Or use mysqlConn
        return { query }
    },
});

const mysql = new Mysql({
  //  详情请参考 [mysql](https://www.npmjs.com/package/mysql) 
}

mysql.connection;

new Sener({
  middlewares: [mysql, router], 
});
```

详情请参考 [mysql](https://www.npmjs.com/package/mysql)


### 3.9 mongodb

支持mongodb连接的中间件

```
npm i sener sener-mongodb
```

```js
import {Sener, Router} from 'sener';
import {MongoDB} from 'sener-mongodb';

const router = new Router({
    'post:/test': async ({ query, queryMongoDB, mongoClient }) => {
        const {db, close} = await queryMongoDB('user');
        // do something
        // Or use mongoClient
        return { query }
    },
});

const mongodb = new MongoDB({
  //  详情请参考 [mongodb](https://www.npmjs.com/package/mongodb)
}

mongodb.client;

new Sener({
  middlewares: [mongodb, router], 
});
```

详情请参考 [mongodb](https://www.npmjs.com/package/mongodb)

## 自定义中间件

文档将持续完善中

现在请参考 [中间件包](https://github.com/theajack/sener/blob/master/packages)


