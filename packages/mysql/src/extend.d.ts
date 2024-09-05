/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */

import { Connection, FieldInfo, QueryOptions } from 'mysql';
import { SQL } from './sql/sql';
import { Cond } from './sql/cond';
import { Table } from './sql/table';
import { Instanceof } from 'sener-types';

export interface ITables {
  [key: string]: typeof Table<any>;
}

export interface IQuerySqlResult<T=any> {
  results: T;
  fields: FieldInfo[];
  msg?: string,
}

export interface IMysqlHelper<Tables extends ITables = {}> {
  sql: <Model extends Record<string, any> = {
    [prop: string]: string|number|boolean,
  }>(name: string)=>SQL<Model>,
  _: typeof Cond,
  // newTable: <Model extends Record<string, any> = {
  //   [prop: string]: string|number|boolean,
  // }>(name: string)=>Table<Model>,
  table: <T extends keyof (Tables) >(name: T)=> Instanceof<(Tables)[T]>;
  querySql: <Return=any>(sql: string|SQL<any, any>|QueryOptions&{
    sql: string|SQL
  }) => Promise<IQuerySqlResult<Return>>;
  mysqlConn: Connection;
}

interface ITablesBase {
  tables: ITables;
}

declare module 'sener-extend' {
  interface Table extends ITablesBase {}
  interface ISenerHelper extends IMysqlHelper<Table['tables']> {}
}