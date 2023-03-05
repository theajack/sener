<!--
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
-->
# [Sener](https://github.com/theajack/sener)

Easy-to-use And Powerful nodejs http server

Documentation will continue to be improved

## 1. Basic Use

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
  middlewares: [router, new Json()], // you_app_name is optional, default to sener dir root as ~/sener-json-db/
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

Middleware that supports logging systems

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
  dir: '', // directory for save config files. default value is ''
  file: 'default', // file name of your config file. default value is 'default'
  // file: ['c1', 'c2'], // Passing in an array indicates that multiple profiles are used
  format: false, // Whether to format the JSON file. Default value: The development environment is false and the production environment is true
})
```


## Custom Middleware

Documentation will continue to be improved

For now please refer to [middleware packages](https://github.com/theajack/sener/blob/master/packages)


