/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import { MiddleWare } from 'sener-types';
import mysql, { Connection, ConnectionConfig } from 'mysql';
import { IMysqlHelper } from './extend';

export class Mysql extends MiddleWare {
    connection: Connection;
    constructor (config: ConnectionConfig) {
        super();
        this.connection = mysql.createConnection(config);
    }

    helper (): IMysqlHelper {
        return {
            querySql: (sql: string) => {
                return new Promise((resolve, reject) => {
                    this.connection.connect();
                    this.connection.query(sql, (error, results, fields = []) => {
                        if (error) {
                            reject(error);
                            return;
                        };
                        resolve({ results, fields });
                        // console.log('The solution is: ', results[0].solution);
                    });
                    this.connection.end();
                });
            },
            mysqlConn: this.connection,
        };
    }


}