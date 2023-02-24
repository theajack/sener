<!--
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
-->
## Sener

Easy-to-use And Powerful nodejs http server

Documentation will continue to be improved

### Basic Use

```
npm i sener
```

Simple demo:

```js
import {Sener} from 'sener';
new Sener();
```

use router:

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

### Use Json middleware

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
  middlewares: [router, new Json('you_app_name')], // you_app_name is optional, default to sener dir root as ~/sener-json-db/
});
```

### Use Static middleware

```js
import {Sener} from 'sener';
import {Static} from 'sener-static';
new Sener({
  middlewares: [new Static()], 
  // new Static({dir}); dir default value is ./public
});
```

## Custom Middleware

Documentation will continue to be improved

For now please refer to [json-middleware](https://github.com/theajack/sener/blob/master/packages/json/src/json-middleware.ts) and [Router](https://github.com/theajack/sener/blob/master/packages/sener/src/middleware/inner-middlewares/router/router.ts)


