/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import {
    IJson,
    ISenerContext,
    MiddleWare
} from 'sener-types';
import { IModels, IMongoHelper } from './extend.d';
import { IMongoProxyOptions, MongoProxy } from './mongo-proxy';
import { MongoCol } from './mongo-col';

export class Mongo<
    T = IJson<MongoCol>,
    Models extends IModels = Record<keyof T, typeof MongoCol>
> extends MiddleWare {
    mongo: MongoProxy<Models>;

    constructor (options: IMongoProxyOptions<Models>) {
        super();
        this.mongo = new MongoProxy<Models>(options);
        this.acceptResponded = this.acceptReturned = true;
    }

    helper (): IMongoHelper<Models> {
        return {
            mongo: this.mongo,
            col: (name) => this.mongo.col(name)
        };
    }
    async init ({ meta }: ISenerContext) {
        // console.log('mongo enter', meta?.db, url, method);
        if (meta?.db !== true) return;
        await this.mongo.connect();
        // console.log('mongo connect', method, this.mongo.connected);
    }

    async leave ({ meta, url, method }: ISenerContext) {
        console.log('mongo leave', meta?.db, url, method);
        if (meta?.db !== true) return;
        await this.mongo.close();
        // console.log('mongo close', method, this.mongo.connected);
    }
}