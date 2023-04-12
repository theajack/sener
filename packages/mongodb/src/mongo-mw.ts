/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import { ICommonReturn, IMiddleWareResponseData, IMiddleWareResponseReturn, IPromiseMayBe, MiddleWare } from 'sener-types';
import { MongoClient } from 'mongodb';
import { IMongoHelper } from './extend';
import { IMongoProxyOptions, MongoProxy } from './mongo-proxy';

export class Mongo extends MiddleWare {
    client: MongoClient;
    mongo: MongoProxy;
    constructor (options: IMongoProxyOptions) {
        super();
        this.mongo = new MongoProxy(options);
    }

    helper (): IMongoHelper {
        return {
            mongo: this.mongo,
            // queryMongoDB: async (dbName: string) => {
            //     await this.client.connect();
            //     console.log('Connected successfully to server');
            //     return {
            //         db: this.client.db(dbName),
            //         close: () => this.client.close()
            //     };
            // },
            // mongoClient: this.client
        };
    }

    response (res: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn<any>> {
        // todo
    }
}