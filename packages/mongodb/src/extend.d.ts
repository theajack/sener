/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */

import type { Instanceof } from 'sener-types';
import type { MongoCol } from './mongo-col';
import type { MongoProxy } from './mongo-proxy';

export interface IModels {
  [key: string]: typeof MongoCol<any>;
}

export interface IMongoHelper<Cols extends IModels> {
  mongo: MongoProxy<Cols>;
  col: <T extends keyof (Cols) >(name: T)=> Instanceof<(Cols)[T]>;
}
interface IModelsBase {
  models: IModels;
}

declare module 'sener-extend' {
  interface Model extends IModelsBase {}
  interface ISenerHelper extends IMongoHelper<Model['models']>{}
}