/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { Files } from 'formidable-fix';
import { IJson } from 'sener-types';

declare module 'sener-types-extend' {
  interface ISenerRequestData {
    files: Files;
    formData: IJson;
  }
}