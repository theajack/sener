/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { IJson } from 'sener-types';

export type IConfig<T = IJson<any>> = {
  $onChange(callback: IConfigChange): void
} & T;

export type IConfigChange = (data:{
  key: string, value: any, prev: any
}) => void;

export interface IConfigHelper<T = IJson<any>> {
  config: IConfig<T>;
}

declare module 'sener' {

  interface IConfigData extends IJson {

  }
  interface ISenerHelper extends IConfigHelper<IConfigData> {

  }
}