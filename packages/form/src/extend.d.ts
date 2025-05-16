/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import type { Files } from 'formidable-fix';
import type { IJson } from 'sener-types';

declare module 'sener-extend' {
  interface ISenerHelper {
    files: Files;
    formData: IJson;
  }
}