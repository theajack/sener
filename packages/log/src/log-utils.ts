/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-04 21:35:30
 * @Description: Coding something
 */
import type { IJson } from 'sener-types';
import type { ILogDBData } from './type';

function toLogString (value: any): string {
    if (typeof value === 'object') {
        return JSON.stringify(value);
    } else {
        return value.toString();
    }
}

const DefaultKeys = [
    'type', 'msg', 'payload', 'traceid',
    'logid', 'duration', 'url', 'ua'
];

export function dataToLogString (data: Partial<ILogDBData>) {
    let content = `[${data.time}]`;
    const keys = Object.keys(data);
    keys.splice(keys.indexOf('time'), 1);
    const append = (key: string) => {
        const v = (data as IJson)[key];
        if (typeof v !== 'undefined' && v !== '') {
            content += ` ${key}=${toLogString(v)};`;
        }
    };

    for (const key of DefaultKeys) {
        append(key);
        keys.splice(keys.indexOf(key), 1);
    }
    for (const key of keys) append(key);
    return content;
}