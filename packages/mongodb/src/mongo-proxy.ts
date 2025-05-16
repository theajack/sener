/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-11 23:49:46
 * @Description: Coding something
 */
import type { MongoClientOptions, Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import type { Instanceof } from 'sener-types';
import type { IModels } from './extend';
import { MongoCol } from './mongo-col';

export interface IMongoProxyOptions<Models> {
    url: string;
    dbName: string;
    models?: Models;
    config?: MongoClientOptions;
}

export class MongoProxy<Models extends IModels = any> {
    client: MongoClient;
    dbName: string;
    db: Db;
    cols: {[key in keyof Models]: Instanceof<Models[key]>} = {} as any;
    models: Models = {} as any;
    connected = false;
    constructor ({
        url, models, dbName, config,
    }: IMongoProxyOptions<Models>) {
        // console.log('MongoProxy 111111111');
        this.client = new MongoClient(url, config);
        if (models) this.models = models;
        if (!dbName) throw new Error('请传入dbName');
        this.switchDB(dbName);
    }
    switchDB (dbName: string) {
        this.dbName = dbName;
        this.db = this.client.db(dbName);
    }
    async connect () {
        if (this.connected) return;
        await this.client.connect();
        this.connected = true;
    }
    async close () {
        if (!this.connected) return;
        // console.log('MongoProxy close');
        await this.client.close();
        this.connected = false;
    }
    async execute (func: () => Promise<any>) {
        if (this.connected) {
            return await func();
        } else {
            await this.connect();
            const data = await func();
            await this.close();
            return data;
        }
    }

    col <Key extends keyof Models> (name: Key): Instanceof<Models[Key]> {

        if (!this.connected) throw new Error(`MongoDB is DISCONNECTED! name=${name as string}`, );
        if (!this.cols[name]) {
            // @ts-ignore
            this.cols[name] = new (this.models[name as any] || MongoCol)(name, this);
        }
        return this.cols[name];
    }
}

// class User extends MongoCol {
//     test () {}
// }

// const p = new MongoProxy<{user: User}>({ url: '', models: { user: User } });

// p.col('user').test