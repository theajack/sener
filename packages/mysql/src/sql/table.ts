/*
 * @Author: chenzhongsheng
 * @Date: 2024-01-18 00:26:22
 * @Description: Coding something
 */
import { IMysqlHelper, IQuerySqlResult } from 'src/extend';
import { ICondition, ISQLPage, IWhere, SQL } from './sql';
import { Mysql } from 'src/mysql-mw';

export class Table<
    Model extends Record<string, any> = Record<string, any>
> {
    sql: SQL;
    helper: IMysqlHelper;

    allKeys: string[] = [];

    constructor (name: string, target: Mysql) {
        this.sql = new SQL(name);
        this.helper = target.helper();
    }

    async find (...conds: ICondition<Model>): Promise<Model|null> {
        return (await this.filter(...conds))[0] || null;
    }

    async exist(...conds: ICondition<Model>): Promise<boolean> {
        return !!(await this.find(...conds));
    }

    async filter (...conds: ICondition<Model>) {
        // console.log(conds);
        const { results } = await this.helper.querySql<Model[]>(
            this.sql.select(...this.allKeys).where(conds)
        );
        return results || [];
    }

    // 从1开始
    async page (data: ISQLPage & IWhere<Model> & {
        orderBy?: {
            keys: (keyof Model)[],
            desc?: boolean,
        }
    } = {}): Promise<Model[]> {
        this.sql.select(...this.allKeys);
        this.sql.where(data.where, data.reverse);
        if(data.orderBy){
            const {keys, desc} = data.orderBy;
            desc ? this.sql.orderByDesc(...keys): this.sql.orderBy(...keys);
        }
        this.sql.page(data);
        // @ts-ignore
        // console.log('comment page: where sql str=', this.sql.sql)
        const { results, fields } = await this.helper.querySql<Model[]>(this.sql);
        // console.log('comment page done')
        return results || [];
    }

    async count (where?: ICondition<Model>, reverse = false) {
        const { results } = await this.helper.querySql(
            this.sql.count().where(where, reverse)
        );
        return results[0]['count(*)'] as number;
    }

    async update(data: Partial<Model>, conds: ICondition<Model>, reverse = false){
        const { results, fields } = await this.helper.querySql(
            this.sql.update(data).where(conds, reverse)
        );
        // console.log('update results, fields', results, fields, this.sql.sql)
        return results;
    }

    async add(data: Partial<Model>) {
        const { results, fields } = await this.helper.querySql(
            this.sql.insert(data)
        );
        // console.log('add results, fields', results, fields, this.sql.sql)
        return results as {
            affectedRows: number,
            insertId: number,
        };
    }

    exec<T = any>(sql: SQL): Promise<IQuerySqlResult> {
        return this.helper.querySql<T>(sql);
    }
}