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

<h3>🚀 Easy-to-use And Powerful nodejs http server</h3>

**[中文](https://github.com/theajack/sener/blob/master/README.cn.md) | [Update log](https://github.com/theajack/sener/blob/master/scripts/version.md) | [Feedback](https://github.com/theajack/sener/issues/new) | [Gitee](https://gitee.com/theajack/sener) | [Message Board](https://theajack.github.io/message-board/?app=sener)**

Documentation will continue to be improved

## 1. Features

1. Simple and efficient architecture, full TS writing, highly friendly TS declaration support
2. Support highly customized middleware system
3. Built-in router middleware
4. JSON middleware: Support JSON files for data storage
5. CORS middleware: supports cross-origin requests
6. Static Middleware: Support static file directories
7. Form middleware: Support formdata parsing and file upload
8. Config middleware: supports highly flexible parameter configuration and dynamic change and monitoring
9.log Middleware: Support flexible logging system and log level control
10. MySQL Middleware: Supports MySQL connections
11. MongoDB middleware: Support for MongoDB connections
12. RPC middleware: remote call support, support client and server use, support injection request X-trace-id

## 2. Basic Use

```
npm i sener
```

Simple demo:

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

Sener stores all files in the sener-data folder

In the development environment, the root directory is the directory where the current cmd is executed, and in the production environment, the root directory is homedir

```js
const BASE_SENER_DIR = path.resolve(
    `${IS_DEV ? process.cwd() : homedir()}`,
    `./sener-data`
);
```


## 3. Middlewares

### 3.1 router

Router middleware

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

Use a JSON file as a database

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

options

```js
new Json({
  dir: '', // directory for save json files. default value is ''
  format: false, // Whether to format the JSON file. Default value: The development environment is false and the production environment is true
})
```

### 3.3 cors

Middleware that handles cross-origin requests

```
npm i sener sener-cors
```

```js
import {Sener, Cors} from 'sener';
new Sener({
  middlewares: [new Cors()], 
  // new Cors(header); Or Set your custom headers
});
```

options

```js
new Cors({
  // headers: Set your custom headers
})
```

### 3.4 static

Middleware that handles static resources

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

options

```js
new Static({
  dir: './public', // Static directory, default value is ./public
})
```

### 3.5 form

Middleware that handles formdata and file uploads

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

options

```js
new Form({
  dir: './public/upload', // File upload directory, default value is ./public/upload
})
```

### 3.6 log

```
npm i sener sener-log
```

Middleware that supports logging systems

```js
import {Sener, Router} from 'sener';
import {Log} from 'sener-log';

const router = new Router({
    'get:/test': ({ query, logger }) => {
        logger.log('msg', 'payload')
        return { data: query }
    },
});

new Sener({
  middlewares: [new Log(), router], 
});
```

typings

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

options

```js
new Log({
  dir: '', // The directory where the log file is stored. default value is '', use root directory
  useConsole: false, // Whether to enable console.log Print logs when the service is running. It is not recommended to turn on the production environment. default value is false
  maxRecords: 10000, // The maximum number of stored records for a single log file , default value is 10000
  level: -1, // The level of log printing, logs with a level less than this number will not be printed
  // level?: (()=>number) Level can also be a method for dynamically obtaining level values, typically used in conjunction with config middleware
})
```

### 3.7 config

Middleware that supports flexible use of JSON configuration files

```
npm i sener sener-config
```

```js
import {Sener, Router} from 'sener';
import {Config} from 'sener-config';

const router = new Router({
    'get:/test': ({ query, config, writeConfig, onConfigChange }) => {
        const level = config.level;
        level(); // read config
        level(5); // write config
        writeConfig('level', 5) // write config with writeConfig
        onConfigChange(({key, value, prev}) => { // on config change
            console.log(key, value, prev);
        })
        return { data: query }
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
  dir: '', // directory for save config files. default value is ''
  file: 'default', // file name of your config file. default value is 'default'
  // file: ['c1', 'c2'], // Passing in an array indicates that multiple profiles are used
  format: false, // Whether to format the JSON file. Default value: The development environment is false and the production environment is true
})
```

### 3.8 mysql

Middleware that supports mysql

```
npm i sener sener-mysql
```

```js
import {Sener, Router} from 'sener';
import {Mysql} from 'sener-mysql';

const router = new Router({
    'get:/test': async ({ query, querySql, mysqlConn }) => {
        const { results, fields } = await querySql('select * from user');
        // Or use mysqlConn
        return { data: query }
    },
});

const mysql = new Mysql({
  //  Please refer to (https://www.npmjs.com/package/mysql) for details 
}

mysql.connection;

new Sener({
  middlewares: [mysql, router], 
});
```

Please refer to [mysql](https://www.npmjs.com/package/mysql) for details 


### 3.9 mongodb

Middleware that supports mongodb

```
npm i sener sener-mongodb
```

```js
import {Sener, Router} from 'sener';
import {MongoDB} from 'sener-mongodb';

const router = new Router({
    'get:/test': async ({ query, queryMongoDB, mongoClient }) => {
        const {db, close} = await queryMongoDB('user');
        // do something
        // Or use mongoClient
        return { data: query }
    },
});

const mongodb = new MongoDB({
  //  Please refer to (https://www.npmjs.com/package/mongodb) for details 
}

mongodb.client;

new Sener({
  middlewares: [mongodb, router], 
});
```

Please refer to [mongodb](https://www.npmjs.com/package/mongodb) for details 

### 3.10 rpc middleware

RPC middleware is used to make remote calls to services deployed on different servers or on different ports of the same server, allowing developers to initiate requests like remote services like function calls

It can also be used in scenarios where web clients initiate requests like the server

The middle will also inject an x-trace-id header into the request to ensure that the interface of the same access call has the same tracid, which can be used effectively with log middleware to locate the problem

```
npm i sener sener-rpc
```

#### 3.10.1 Server-side usage

1. Use configuration

```js
import {Sener, Router} from 'sener';
import {RPC} from 'sener-rpc';

const router = new Router({
    'get:/test': async ({ query, rpc }) => {
        const list = rpc.comment.get('/message', {page: 1}); // url and query
        // use rpc.comment.request for more details
        return { data: {query, list} }
    },
});
new Sener({
  middlewares: [new RPC({
    user: 'http://localhost:3000', // The access base address of the user service
    comment: 'http://localhost:3001', // The access base address of the comment service
  }), router], 
});
```

2. Use the createServices function

```js
import {Sener, Router} from 'sener';
import {RPC, Request} from 'sener-rpc';

class CommentRequest extends Request {
    getList ({ app = 'common', index = 1 }: {
        app?: string
        index?: number
    } = {}) {
        return this.get('/message', {
            app,
            index,
            size: 10,
        });
    }
}

function createServices(traceid = '') {
    const base = (port: number) => `http://localhost:${port}`;
    return {
        comment: new CommentRequest({ base: base(3001), traceid }),
    };
}

const router = new Router({
    'get:/test': async ({ query, rpc }) => {
        const list = rpc.comment.getList();
        return { data: {query, list} }
    },
});

new Sener({
  middlewares: [new RPC(createServices), router], 
});
```

#### 3.10.1 Client use

1. npm use

```
npm i sener-rpc
```

```js
import {WebRPC} from 'sener-rpc/dist/web.umd';

// 1. A single service can pass in the base address
const comment = new WebRPC('http://localhost:3001');
await comment.comment.get('/message', {page: 1});

// 2. Multiple services pass into the map
const rpc = new WebRPC({
    user: 'http://localhost:3000', // The access base address of the user service
    comment: 'http://localhost:3001', // The access base address of the comment service
});
await rpc.comment.comment.get('/message', {page: 1});

// 3. Use inheritance
class Comment extends WebRPC {
    getList ({ app = 'common', index = 1 }: {
        app?: string
        index?: number
    } = {}) {
        return this.get('/message', {
            app,
            index,
            size: 10,
        });
    }
}
await (new Comment()).getList();
```

2. cdn use

```html
<script src='https://cdn.jsdelivr.net/npm/sener-rpc'></script>
<script>
  SenerRpc.WebRPC
</script>
```

## Custom Middleware

Documentation will continue to be improved

For now please refer to [middleware packages](https://github.com/theajack/sener/blob/master/packages)


