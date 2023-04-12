/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-11 23:49:46
 * @Description: Coding something
 */
import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { IJson } from 'sener-types';
import { MongoCol } from './mongo-col';

export interface IMongoProxyOptions {
    url: string;
    models?: IJson<typeof MongoCol>;
    dbName?: string;
    config?: MongoClientOptions;
}

export class MongoProxy<T extends IJson<MongoCol> = IJson<MongoCol>> {
    client: MongoClient;
    dbName: string;
    db: Db;
    cols: T = {} as any;
    models: IJson<typeof MongoCol> = {};
    constructor ({
        url, models, dbName, config,
    }: IMongoProxyOptions) {
        this.client = new MongoClient(url, config);
        if (models) this.models = models;
        if (dbName) this.switchDB(dbName);
    }
    switchDB (dbName: string) {
        this.dbName = dbName;
        this.db = this.client.db(dbName);
    }
    connect () {return this.client.connect();}
    close () {return this.client.close();}
    async execute (func: () => Promise<void>) {
        await this.connect();
        await func();
        await this.close();
    }

    col <Key extends keyof T> (name: Key): T[Key] {
        if (!this.cols[name]) {
            // @ts-ignore
            this.cols[name] = new (this.models[name as any] || MongoCol)(name);
        }
        return this.cols[name];
    }
}

// class User extends MongoCol {
//     test () {}
// }

// const p = new MongoProxy<{user: User}>({ url: '', models: { user: User } });

// p.col('user').test