/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { IJson } from 'sener-types';

export type IConfig = IJson<{
  <T=any>(): T;
  <T=any>(value: T): void;
}>

export type IConfigChange = (data:{
  key: string, value: any, prev: any
}) => void;

export interface IConfigHelper {
  config: IConfig;
  writeConfig(key: string, v: any): boolean
  onConfigChange(callback: IConfigChange): void;
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IConfigHelper {

  }
}