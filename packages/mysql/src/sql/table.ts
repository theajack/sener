/*
 * @Author: chenzhongsheng
 * @Date: 2024-01-18 00:26:22
 * @Description: Coding something
 */
import { IMysqlHelper, IQuerySqlResult } from 'src/extend';
import { ICondition, ISQLPage, IWhere, SQL } from './sql';
import { Mysql } from 'src/mysql-mw';
import { QueryOptions } from 'mysql';

export class Table<
    Model extends Record<string, any> = Record<string, any>,
    Key = keyof Model,
> {
    sql: SQL<Model, Key>;
    helper: IMysqlHelper;

    allKeys: (Key)[] = [];

    private useKeys: ((Key|1)[])|null = null;
    private limitValue: number|null = null;

    get selectKeys(){
        return this.useKeys || this.allKeys;
    }

    constructor (name: string, target: Mysql) {
        this.sql = new SQL<Model, Key>(name);
        this.helper = target.helper();
    }

    limit(v: number){
        this.limitValue = v;
        return this;
    }

    async find (...conds: ICondition<Model>): Promise<Model|null> {
        return (await this.limit(1).filter(...conds))[0] || null;
    }

    keys(...list: (Key|1)[]){
        this.useKeys = list;
        return this;
    }

    async exist(...conds: ICondition<Model>): Promise<boolean> {
        return !!(await this.keys(1).find(...conds));
    }

    async filter (...conds: ICondition<Model>) {
        // console.log(conds);
        const { results } = await this.querySql<Model[]>(
            this.sql.select(...this.selectKeys).where(conds)
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
        this.sql.select(...this.selectKeys).where(data.where, data.reverse);
        if(data.orderBy){
            const {keys, desc} = data.orderBy;
            desc ? this.sql.orderByDesc(...keys): this.sql.orderBy(...keys);
        }
        this.sql.page(data);
        // @ts-ignore
        // console.log('comment page: where sql str=', this.sql.sql)
        const { results, fields } = await this.querySql<Model[]>(this.sql);
        // console.log('comment page done')
        return results || [];
    }

    async count (where?: ICondition<Model>, reverse = false) {
        const { results } = await this.querySql(
            this.sql.count().where(where, reverse)
        );
        return results[0]['count(1)'] as number;
    }

    async update(data: {
        [prop in keyof Model]?: Model[prop]|string
    }, conds: ICondition<Model>, reverse = false){
        const { results, fields } = await this.querySql(
            this.sql.update(data).where(conds, reverse)
        );
        // console.log('update results, fields', results, fields, this.sql.sql)
        return results;
    }

    async add(data: Partial<Model>) {
        const { results, fields } = await this.querySql(
            this.sql.insert(data)
        );
        // console.log('add results, fields', results, fields, this.sql.sql)
        return results as {
            affectedRows: number,
            insertId: number,
        };
    }

    exec<T = any>(sql: SQL): Promise<IQuerySqlResult> {
        return this.querySql<T>(sql);
    }

    private async querySql <Return=any>(sql: string|SQL<any, any>|QueryOptions&{
        sql: string|SQL
    }): Promise<IQuerySqlResult<Return>> {
        if(this.useKeys) this.useKeys = null;
        if(this.limitValue) {
            // @ts-ignore
            if(sql.tableName && sql.sql.indexOf(' LIMIT ') === -1){
                (sql as SQL).limit(this.limitValue);
            }
            this.limitValue = null;
        }
        return this.helper.querySql(sql);
    }
}