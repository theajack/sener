/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:05:39
 * @Description: Coding something
 */

import { dateToString, IJson, uuid } from 'sener-types';
import {
    IBaseInfo, ILogDBData, IMessageData
} from './type';

export class BaseInfo {
    name: string;

    durationStart: number;

    data: IBaseInfo = {
        traceid: '',
        host: '', //
        url: '',
        ua: '',
    };

    constructor (baseInfo?: Partial<IBaseInfo>) {
        this.refreshTraceId();
        if (baseInfo) this.injectBaseInfo(baseInfo);
    }

    refreshTraceId () {
        this.data.traceid = uuid();
        this.refreshDurationStart();
    }
    refreshDurationStart () {
        this.durationStart = Date.now();
    }
    injectBaseInfo (baseInfo: Partial<IBaseInfo>) {
        Object.assign(this.data, baseInfo);
    }

    appendBaseInfo (data: IMessageData): Partial<ILogDBData> {
        const date = new Date();
        const timestamp = date.getTime();
        const time = dateToString({ type: 'ms' });
        const duration = timestamp - this.durationStart;

        const extend: IJson = {};
        if (data.extend) {
            for (const k in data.extend)
                extend[`_${k}`] = data.extend[k];
            delete data.extend;
        }

        const result = Object.assign(data, this.data, {
            timestamp,
            time,
            logid: uuid(),
            duration,
        }, extend);

        return result;
    }

}