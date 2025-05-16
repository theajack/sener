
/*
 * @Author: tackchen
 * @Date: 2022-07-24 16:35:16
 * @Description: Coding something
 */

import type { IJson } from 'sener-types';

export type TLogType = 'error' | 'log' | 'warn' | 'info';

export class logger {
}
// 日志存储的数据
export interface ILogDBData {
  traceid: string;
  host: string; //
  url: string;
  ua: string; //

  msg: string; //
  payload: any;
  type: TLogType;
  level: number;

  duration: number;
  time: string;
  timestamp: number;
  logid: string;
}

export type IBaseInfo = Pick<ILogDBData,
  'traceid' | 'host' | 'url' | 'ua'
>
export type IMessageData = Partial<Pick<
    ILogDBData,
    'msg' | 'payload' | 'type' | 'level'
>> & {extend?: IJson}