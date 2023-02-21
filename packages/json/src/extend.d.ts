/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { File, IOprateReturn } from './file';

export interface IJsonHelper {
  file: (key: string) => File;
  json: (key: string) => IOprateReturn
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IJsonHelper {

  }
}