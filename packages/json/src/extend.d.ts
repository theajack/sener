/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { IJson } from 'sener-types';
import { File, IOprateReturn } from './file';

export interface IJsonHelper {
  file: <Model=any>(key: string) => File<Model>;
  write: <Model=any>(key: string) => IOprateReturn<Model>;
  read: <Model=any>(key: string) => Model[];
  readMap: <Model=any>(key: string) => IJson<Model>;
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IJsonHelper {

  }
}