/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import { ICommonReturn, IMiddleWareRequestData, IMiddleWareResponseData, IMiddleWareResponseReturn, IPromiseMayBe, MiddleWare } from 'sener-types';
import { ILoggerOptions, Logger } from './logger';
import { IBaseInfo } from './type';

export class Log extends MiddleWare {
    loggerOptions: ILoggerOptions;
    constructor (options: ILoggerOptions = {}) {
        super();
        this.loggerOptions = options;
    }
    enter (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn> {
        // console.log(req.request.headers, req.request.headers.origin);
        const headers = req.request.headers;

        // console.log('headers.referer', headers);

        const baseInfo: Partial<IBaseInfo> = {
            host: headers.host,
            url: headers.referer,
            ua: headers['user-agent'],
        };

        const tid = headers['x-trace-id']; // 请求的traceid
        if (tid) baseInfo.traceid = tid as string;

        req.logger = new Logger(this.loggerOptions, baseInfo);
    }

    response ({ response, logger }: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn<any>> {
        response.setHeader('x-trace-id', logger.traceid);
    }
}
