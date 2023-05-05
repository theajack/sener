/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import {
    ICommonReturn, IJson,
    IMiddleWareRequestData,
    IMiddleWareResponseReturn,
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
    }


    helper (): IMongoHelper<Models> {
        return {
            mongo: this.mongo,
            col: (name) => this.mongo.col(name)
        };
    }

    async enter ({ meta }: IMiddleWareRequestData): Promise<ICommonReturn> {
        // console.log('mongo enter', url, method, meta?.db);
        if (meta?.db !== true) return;
        await this.mongo.connect();
        // console.log('mongo connect', method, this.mongo.connected);
    }


    async leave ({ meta }: IMiddleWareRequestData): Promise<ICommonReturn | IMiddleWareResponseReturn<any>> {
        // console.log('mongo leave', meta);
        if (meta?.db !== true) return;
        await this.mongo.close();
        // console.log('mongo close', method, this.mongo.connected);
    }
}