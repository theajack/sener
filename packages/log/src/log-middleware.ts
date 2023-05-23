/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import { ISenerContext, MiddleWare } from 'sener-types';
import { ILoggerOptions, Logger } from './logger';
import { IBaseInfo } from './type';

export class Log extends MiddleWare {
    loggerOptions: ILoggerOptions;
    logger: Logger;
    constructor (options: ILoggerOptions = {}) {
        super();
        this.loggerOptions = options;
        this.logger = new Logger(options);
    }
    init (ctx: ISenerContext) {
        // console.log(req.request.headers, req.request.headers.origin);
        const headers = ctx.request.headers;

        // console.log('headers.referer', headers);

        const baseInfo: Partial<IBaseInfo> = {
            host: headers.host,
            url: headers.referer,
            ua: headers['user-agent'],
        };

        const tid = headers['x-trace-id']; // 请求的traceid
        if (tid) {
            baseInfo.traceid = tid as string;
            this.logger.refreshDurationStart();
        } else {
            this.logger.refreshTraceId();
        }

        this.logger.setBaseInfo(baseInfo);
        ctx.logger = this.logger;
        ctx.headers['x-trace-id'] = this.logger.traceid;
    }
}
