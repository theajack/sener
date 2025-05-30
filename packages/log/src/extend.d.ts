/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-04 23:09:53
 * @Description: Coding something
 */

import type { Logger } from './logger';

export interface ILogHelper {
  logger: Logger;
}

declare module 'sener-extend' {
  interface ISenerHelper extends ILogHelper {

  }
}