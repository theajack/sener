/*
 * @Author: chenzhongsheng
 * @Date: 2024-01-18 00:26:22
 * @Description: Coding something
 */
import { IMysqlHelper } from 'src/extend';
import { ICondition, ISQLPage, IWhere, SQL } from './sql';
import { Mysql } from 'src/mysql-mw';

export class Table<
    Model extends Record<string, any> = Record<string, any>
> {
    sql: SQL;
    helper: IMysqlHelper;

    constructor (name: string, target: Mysql) {
        this.sql = new SQL(name);
        this.helper = target.helper();
    }

    async find (...conds: ICondition<Model>): Promise<Model|null> {
        return (await this.filter(...conds))[0] || null;
    }

    async filter (...conds: ICondition<Model>) {
        console.log(conds);
        const { results } = await this.helper.querySql<Model[]>(
            this.sql.select().where(conds)
        );
        return results;
    }

    async page (data: ISQLPage & IWhere<Model> = {}) {
        const { results } = await this.helper.querySql<Model[]>(
            this.sql.select().page(data).where(data.where)
        );
        return results;
    }

    async count (where?: ICondition<Model>) {
        const { results } = await this.helper.querySql(
            this.sql.count().where(where)
        );
        return results[0]['count(*)'] as number;
    }
}