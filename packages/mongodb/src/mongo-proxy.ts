/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-11 23:49:46
 * @Description: Coding something
 */
import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { Instanceof } from 'sener-types';
import { IModels } from './extend';
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
        const client = await this.client.connect();
        this.connected = true;
        return client;
    }
    close () {
        this.connected = false;
        return this.client.close();
    }
    async execute (func: () => Promise<void>) {
        await this.connect();
        await func();
        await this.close();
    }

    col <Key extends keyof Models> (name: Key): Instanceof<Models[Key]> {
        if (!this.connected) throw new Error('MongoDB is DISCONNECTED!');
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