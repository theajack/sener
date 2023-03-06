/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */

import { Connection, FieldInfo, QueryOptions } from 'mysql';

export interface IMysqlHelper {
  querySql: (sql: string|QueryOptions) => Promise<{
    results: any;
    fields: FieldInfo[];
  }>;
  mysqlConn: Connection;
}

declare module 'sener-types-extend' {
  interface ISenerHelper extends IMysqlHelper {

  }
}