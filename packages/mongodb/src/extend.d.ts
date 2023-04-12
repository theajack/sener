/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */

import type { MongoProxy } from './mongo-proxy';

export interface IMongoHelper {
  mongo: MongoProxy;
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IMongoHelper {

  }
}