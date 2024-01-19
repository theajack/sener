/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import { IJson, Instanceof, MiddleWare } from 'sener-types';
import mysql, { Connection, ConnectionConfig } from 'mysql';
import { IMysqlHelper, ITables } from './extend';
import { Cond } from './sql/cond';
import { SQL } from './sql/sql';
import { Table } from './sql/table';

export interface IMysqlConfig<Tables> extends ConnectionConfig {
    tables?: Tables;
}

export class Mysql<
    T = IJson<Table>,
    Tables extends ITables = Record<keyof T, typeof Table>
> extends MiddleWare {
    connection: Connection;

    sqlMap: Record<string, SQL<any>> = {};

    tables: {[key in keyof Tables]: Instanceof<Tables[key]>} = {} as any;
    tableModels: Tables = {} as any;
    constructor (config: ConnectionConfig & {
        tables?: Tables;
    }) {
    // constructor (config: IMysqlConfig<Tables>) {
        super();
        this.connection = mysql.createConnection(config);
    }

    private _helper: IMysqlHelper<Tables>;


    table <Key extends keyof Tables> (name: Key): Instanceof<Tables[Key]> {
        if (!this.tables[name]) {
            // @ts-ignore
            this.tables[name] = new (this.tableModels[name as any] || Table)(name, this);
        }
        return this.tables[name];
    }

    helper (): IMysqlHelper<Tables> {
        if (!this._helper) {
            this._helper = {
                querySql: (target) => {
                    let sql: any = '';
                    if (typeof target === 'string') {
                        sql = target;
                    } else {
                        if (target instanceof SQL) {
                            sql = target.v;
                        } else {
                            // @ts-ignore
                            if (typeof target.sql !== 'string') target.sql = target.sql.v;
                            sql = target;
                        }
                    }
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
                _: Cond,
                sql: (name) => {
                    if (!this.sqlMap[name])
                        this.sqlMap[name] = new SQL(name);
                    return this.sqlMap[name];
                },
                table: (name) => this.table(name),
                mysqlConn: this.connection,
            };
        }
        return this._helper;
    }

}