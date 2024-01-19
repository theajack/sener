/*
 * @Author: chenzhongsheng
 * @Date: 2023-05-19 08:43:22
 * @Description: Coding something
 */
import http, { IncomingMessage } from 'http';
import { IHelperFunc, parseParam, praseUrl, ISenerResponse } from 'sener-types';
import {
    IJson, IServeMethod, IHttpInfo,
} from 'sener-types';


function responseHtml (html: string, headers?: IJson<string>) {
    return responseData({
        data: html,
        statusCode: 200,
        headers: Object.assign(
            { 'Content-Type': 'text/html; charset=utf-8' },
            headers,
        )
    });
}

function response404 (message = 'Page not found', headers?: IJson<string>) {
    return responseText(message, headers, 404);
}

function responseText (str: string, headers: IJson<string> = {}, statusCode = 200) {
    return responseData({
        data: str,
        statusCode,
        headers: Object.assign(
            { 'Content-Type': 'text/plain; charset=utf-8' },
            headers,
        )
        // text/html; charset=utf-8
        // application/x-www-form-urlencoded
        // multipart/form-data
    });
}

function responseData ({
    data = '',
    statusCode = 200,
    headers = { 'Content-Type': 'application/json;charset=UTF-8' },
    success,
}: ISenerResponse): ISenerResponse {
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    if (typeof success === 'undefined') {
        success = (statusCode < 400 && statusCode >= 200);
    }
    return {
        data, statusCode, headers, success
    };
}

// mr => markResponded
export function createSenerHelper (headers: IJson<string>, mr: (key?: string)=>void): IHelperFunc {
    const mergeHeaders = (header: IJson<string> = {}) => Object.assign({}, headers, header);
    const sendHelper: IHelperFunc = {
        response404: (msg, header = {}) => (mr(), response404(msg, mergeHeaders(header))),
        responseJson: (data, statusCode = 200, header = {}) => (mr(), responseData({ data, statusCode, headers: mergeHeaders(header) })),
        responseText: (msg, statusCode, header = {}) => (mr(), responseText(msg, mergeHeaders(header), statusCode)),
        responseHtml: (html, header = {}) => (mr(), responseHtml(html, mergeHeaders(header))),

        // alias html
        html: (html, header = {}) => (mr(), responseHtml(html, mergeHeaders(header))),
        responseData: (data: ISenerResponse) => (mr(), responseData({ ...data, headers: mergeHeaders(data.headers) })),
        markReturned: () => {mr('returned');}
    };
    return sendHelper;
}


export async function parseHttpInfo (request: http.IncomingMessage): Promise<IHttpInfo> {
    const { headers, method } = request;
    const { url, query } = praseUrl(request.url);
    const ip = request.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        request.connection.remoteAddress || // 判断 connection 的远程 IP
        request.socket.remoteAddress || // 判断后端的 socket 的 IP
        // @ts-ignore
        request.connection?.socket?.remoteAddress;
    const result = headers.origin?.match(/https?:\/\/(.*?)(:|$)/);
    const clientDomain = result ? result[1]:'';
    return {
        requestHeaders: headers,
        clientDomain,
        method: method as IServeMethod,
        url,
        query,
        ip,
        ...(await parseBody(request))
    };
}

async function parseBody (request: IncomingMessage) {
    return new Promise<{body: IJson, buffer: Buffer|null}>((resolve) => {
        const chunks: any[] = [];
        const contentType = request.headers['content-type'] || '';
        // console.log('contentType', contentType);
        if (contentType.includes('multipart/form-data')) {
            resolve({ body: {}, buffer: null });
            return;
        }
        request.on('error', (err) => {
            console.error(err);
        }).on('data', (chunk) => {
            chunks.push(chunk);
        }).on('end', () => {
            const buffer = Buffer.concat(chunks);
            let body: IJson<string> = {};

            if (request.headers['content-type']?.includes('application/json')) {
                const bodyStr = buffer.toString();
                // todo 根据 header 判断
                try {
                    body = JSON.parse(bodyStr);
                } catch (e) {
                    body = parseParam(bodyStr);
                }
            }
            resolve({
                body,
                buffer,
            });
        });
    });
}