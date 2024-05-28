/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IHookReturn, IPromiseMayBe,
    ISenerContext,
    IServeMethod,
} from 'sener-types';

/*
1. Access-Control-Allow-Origin：HTTP响应头，指定服务器端语序进行跨域资源访问的来源域，可以用通配符 * 来表示允许任何域的JS访问资源, 在响应一个携带身份信息（Credential）的HTTP请求时，不能使用通配符，必须指定具体域
2. Access-Control-Allow-Methods：HTTP响应头，指定服务器允许进行跨域资源访问的请求方法列表，一般用在响应预检请求上
3. Access-Control-Allow-Headers：HTTP响应头，指定服务器允许进行跨域资源访问的请求头列表，一般用在响应预检请求上
4. Access-Control-Expose-Headers：服务器端允许客户端或者CORS资源的同时能够访问到的header信息
5. Access-Control-Max-Age：HTTP响应头，用在响应预检请求上，表示是本次预检响应的有效时间
6. Access-Control-Allow-Credentials：HTTP响应头，凡是浏览器请求中携带了身份信息，而在响应头中没有返回Access0COntrol-Allow-Credentials:true的，浏览器都会忽略此次响应
*/

const Names = {
    origin: 'Access-Control-Allow-Origin',
    methods: 'Access-Control-Allow-Methods',
    headers: 'Access-Control-Allow-Headers',
    credentials: 'Access-Control-Allow-Credentials',
    exposeHeaders: 'Access-Control-Expose-Headers',
    maxAge: 'Access-Control-Max-Age',
};

interface ICorsOptions {
    origin?: string;
    methods?: IServeMethod[]|string;
    headers?: string[]|string;
    credentials?: boolean;
    exposeHeaders?: string[]|string;
    maxAge?: number;
}

const DefaultHeaders = {
    [Names.origin]: '*',
    [Names.methods]: 'POST, GET, PUT, DELETE, OPTIONS',
    [Names.headers]: '*',
    [Names.credentials]: 'true',
    // [Names.exposeHeaders]: '',
    // [Names.maxAge]: '',
};


type IHeaderKey = {
    [prop in keyof typeof DefaultHeaders]?: string;
}

export class Cors extends MiddleWare {
    name = 'cors';
    headers: IHeaderKey;
    acceptOptions = true;
    acceptResponded = true;

    constructor (options: ICorsOptions = {}) {
        super();
        const headers: any = {};
        for (const k in options) {
            // @ts-ignore
            const v = options[k];
            // @ts-ignore
            const key = Names[k];
            if (!key || !v) continue;
            headers[key] = (v instanceof Array) ? v.join(', ') : v.toString();
        }
        this.headers = Object.assign({}, DefaultHeaders, headers);
    }

    init ({ headers }: ISenerContext): IPromiseMayBe<IHookReturn> {
        Object.assign(headers, this.headers);
        // console.log('cors init', !!headers['Access-Control-Allow-Origin'])
    }

}
