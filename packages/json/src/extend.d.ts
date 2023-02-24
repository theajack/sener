/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { File, IOprateReturn } from './file';

export interface IJsonHelper {
  file: (key: string) => File;
  write: (key: string) => IOprateReturn;
  read: (key: string) => any[];
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IJsonHelper {

  }
}