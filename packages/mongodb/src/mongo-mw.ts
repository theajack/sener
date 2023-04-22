/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import {
    ICommonReturn, IJson, IMiddleWareRequestData,
    IMiddleWareResponseData, IMiddleWareResponseReturn,
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
        console.log('mongo enter', meta?.db);
        if (meta?.db !== true) return;
        await this.mongo.connect();
        console.log('mongo connect');
    }


    async leave ({ meta }: IMiddleWareResponseData): Promise<ICommonReturn | IMiddleWareResponseReturn<any>> {
        // console.log('mg response meta', meta);
        if (meta?.db !== true) return;
        await this.mongo.close();
        console.log('mongo close');
    }
}