/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:28:27
 * @Description: Coding something
 */

import type { IRouterReturn } from 'sener-types';

export interface IBoolResult<T=any> {
  success: boolean;
  msg: string;
  data: T
}

export type IParsedData<T=any> = IBoolResult<T> & {
  [prop: string]: any;
};

export type IParsedReturn<T=any> = Promise<IParsedData<T>>;

export type IRequestReturn<T=any> = Promise<IRouterReturn<T>>;