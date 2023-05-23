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
import { IJson } from 'sener-types';

export interface ILoggerOptions {
    dir?: string;
    useConsole?: boolean;
    maxRecords?: number;
    level?: (()=>number)|number;
    interval?: number;
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
        interval,
    }: ILoggerOptions, baseInfo?: Partial<IBaseInfo> & IJson) {
        if (!Logger.saver) {
            Logger.saver = new Saver({ dir, maxRecords, level, interval });
        }
        this.useConsole = useConsole;
        this.base = new BaseInfo(baseInfo);
    }

    setBaseInfo (data: Partial<IBaseInfo> & IJson) {
        this.base.injectBaseInfo(data);
    }

    setLogLevel (l: number) {
        Logger.saver.level = () => l;
    }

    save () {
        Logger.saver.save();
    }

    newLogFile () {
        Logger.saver.refreshFileName();
    }

    count () {
        return Logger.saver.countLines();
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