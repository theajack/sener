/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-11 23:50:06
 * @Description: Coding something
 */

import { Collection } from 'mongodb';
import { IJson } from 'sener-types';
import type { MongoProxy } from './mongo-proxy';

export class MongoCol<T extends any = IJson> {
    name = '';
    col: Collection;
    mongoProxy: MongoProxy;
    constructor (name: string, mongoProxy?: MongoProxy) {
        this.name = name;
        if (mongoProxy) {
            this.init(mongoProxy);
        }
    }

    init (mongo: MongoProxy) {
        this.mongoProxy = mongo;
        this.col = this.mongoProxy.db.collection(this.name);
        this.mongoProxy.cols[this.name] = this;
    }

    // 增
    add (data: T|T[]) {
        return (data instanceof Array) ?
            this.col.insertMany(data as any) :
            this.col.insertOne(data as any);
    }
    // 删
    remove (filter: IJson, all = false) {
        return all ?
            this.col.deleteMany(filter) :
            this.col.deleteOne(filter);
    }

    // 改
    update (
        filter: any,
        update: any,
        all = false
    ) {
        return all ?
            this.col.updateOne(filter, update) :
            this.col.updateMany(filter, update);
    }

    // 查
    find (filter = {}): Promise<T[]> {
        return this.col.find(filter).toArray() as any;
    }

    // 分页
    async page ({
        index,
        size = 10,
        filter = {},
        needCount = false,
    }: {
        filter?:IJson,
        index: number,
        size?: number,
        needCount?: boolean
    }): Promise<{
        data: T[], totalCount: number, totalPage: number, index: number
    }> {
        if (needCount) {
            const totalCount = await this.count(filter);
            return {
                index,
                totalCount,
                totalPage: Math.floor(totalCount / size),
                data: await this.slice({ filter, index: (index - 1) * size, size })
            };
        }
        return {
            index,
            totalCount: -1,
            totalPage: -1,
            data: await this.slice({ filter, index: (index - 1) * size, size })
        };
    }

    // 分片
    async slice ({
        index,
        filter = {},
        size = 10,
    }: {
        filter?: IJson,
        index: number,
        size?: number,
    }): Promise<T[]> {
        if (typeof size === 'string') size = parseInt(size);
        if (typeof index === 'string') index = parseInt(index);
        return this.col.find(filter).skip((index) * size).limit(size).toArray() as any;
    }

    // this.col.aggregate([{$group : {_id : "$by_user", num_tutorial : {$sum : 1}}}])

    // 计数
    count (filter = {}): Promise<number> {
        return this.col.countDocuments(filter);
    }
}