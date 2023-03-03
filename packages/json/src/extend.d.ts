/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { File, IOprateReturn } from './file';

export interface IJsonHelper {
  file: <Model=any>(key: string) => File<Model>;
  write: <Model=any>(key: string) => IOprateReturn<Model>;
  read: <Model=any>(key: string) => Model[];
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IJsonHelper {

  }
}