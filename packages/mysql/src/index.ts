/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:22:38
 * @Description: Coding something
 */
export { Mysql } from './mysql-mw';

export * from 'mysql';

import _mysql from 'mysql';

export const mysql = _mysql;

export { Cond, Cond as $ } from './sql/cond';

export { SQL } from './sql/sql';
export { Table } from './sql/table';