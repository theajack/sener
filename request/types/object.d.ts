/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 01:25:51
 * @Description: Coding something
 */

import { IBaseData, IBaseTimeData } from './sample';

export interface IUser extends IBaseData {
  pwd: string;
  tk: string;
  expire: number;
  nickname: string;
  email: string;
}

interface IContent extends IBaseTimeData {
  contact: string,
  content: string,
  name: string,
}

export interface IReply extends IContent {
}

export interface IComment extends IContent, IBaseData {
  reply: IReply[],
}