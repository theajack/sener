/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import { MiddleWare } from 'sener-types';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { IMongoHelper } from './extend';

export class MongoDB extends MiddleWare {
    client: MongoClient;
    constructor (url: string, config?: MongoClientOptions) {
        super();
        this.client = new MongoClient(url, config);
    }

    helper (): IMongoHelper {
        return {
            queryMongoDB: async (dbName: string) => {
                await this.client.connect();
                console.log('Connected successfully to server');
                return {
                    db: this.client.db(dbName),
                    close: () => this.client.close()
                };
            },
            mongoClient: this.client
        };
    }
}