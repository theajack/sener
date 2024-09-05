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

    private _config: IMysqlConfig<Tables>;
    constructor (config: IMysqlConfig<Tables>) {
        super();
        this._config = config;
        if (config.tables) this.tableModels = config.tables;
        this.initConnection();
        // this._handleDisconnect();
    }

    private initConnection () {
        this.connection = mysql.createConnection(this._config);
        this.connection.connect();
    }

    // private _handleDisconnect(){
    //     this.connection.on('error', (err) => {
    //         this.handlerError(err);
    //     });
    // }

    private handlerError (err: any) {
        // if (!err.fatal) {
        //     return;
        // }
        // if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
        //     throw err;
        // }
        console.log('Re-connecting lost connection: ' + err.stack);
        try {
            this.initConnection();
        } catch (e) {
            console.log('connection error', e);
            this.handlerError(e);
        }
    }

    private _helper: IMysqlHelper<Tables>;

    table <Key extends keyof Tables> (name: Key): Instanceof<Tables[Key]> {
        // console.log('table keys = ', Object.keys(this.tables))
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
                    return new Promise((resolve) => {
                        // console.log('query sql', sql);
                        this.connection.query(sql, (error, results, fields = []) => {
                            if (error) {
                                console.log('mysql query error', error);
                                // this.handlerError(err);
                                resolve({ results: null, fields: null, msg: error.toString() } as any);
                                this.handlerError(error);
                                return;
                            }
                            // console.log('query sql success');
                            resolve({ results, fields });
                            // console.log('The solution is: ', results[0].solution);
                        });
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