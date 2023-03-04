/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-04 20:47:30
 * @Description: Coding something
 */

import { BaseInfo } from './base-info';
import { IBaseInfo, IMessageData, TLogType } from './type';
import { Saver } from './saver';
import { dataToLogString } from './log-utils';
import { TLog } from './t-log';

export interface ILoggerOptions {
    dir?: string;
    useConsole?: boolean;
    maxRecords?: number;
    level?: number;
}

export class Logger {
    base: BaseInfo;

    static saver: Saver;

    useConsole = false;

    constructor ({
        dir = '',
        useConsole = false,
        maxRecords,
        level = -1,
    }: ILoggerOptions, baseInfo?: Partial<IBaseInfo>) {
        if (!Logger.saver) {
            Logger.saver = new Saver({ dir, maxRecords, level });
        }
        this.useConsole = useConsole;
        this.base = new BaseInfo(baseInfo);
    }

    get traceid () {
        return this.base.data.traceid;
    }

    log (msg: string|IMessageData, payload?: any, type: TLogType = 'log') {

        const messageData = (typeof msg === 'string') ? {
            msg, payload, type
        } : msg;

        const data = this.base.appendBaseInfo(messageData);

        const content = dataToLogString(data);

        Logger.saver.addContent(content, data.level);

        if (this.useConsole) {
            (TLog[messageData.type || 'log'] || console.log)(content);
        }
    }

    refreshDurationStart () {this.base.refreshDurationStart();}
    refreshTraceId () {this.base.refreshTraceId();}
}