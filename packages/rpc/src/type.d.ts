/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:28:27
 * @Description: Coding something
 */

import { IJson, IMiddleWareResponseReturn, IRouterReturn } from 'sener-types';

export interface IBoolResult {
  success: boolean;
  msg?: string;
}

export type IParsedData = IBoolResult & IJson;

export type IParsedReturn = Promise<IParsedData>;

export type IRequestReturn<T=any> = Promise<IMiddleWareResponseReturn<IRouterReturn<T>>>;