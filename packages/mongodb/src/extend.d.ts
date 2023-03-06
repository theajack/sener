/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */

import { Db, MongoClient } from 'mongodb';

export interface IMongoHelper {
  queryMongoDB: (dbName: string) => Promise<{
    db: Db;
    close: () => Promise<void>;
  }>;
  mongoClient: MongoClient;
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IMongoHelper {

  }
}