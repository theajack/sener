import { parseCondContent, toSqlStr } from './cond';

/*
 * @Author: chenzhongsheng
 * @Date: 2024-01-17 22:36:27
 * @Description: Coding something
 */
export interface ISQLPage {
    index?: number,
    size?: number,
}

export type ICondition<Model> = ({
    [prop in keyof Model]?: any
})[];

export interface IWhere<Model> {
    where?: ICondition<Model>;
    reverse?: boolean;
}

export class SQL<
    Model extends Record<string, any> = {
        [prop: string]: string|number|boolean,
    },
    Key = keyof Model,
> {
    private tableName: string;

    private sql: string;

    constructor (tableName: string) {
        this.tableName = tableName;
        this.reset();
    }

    private reset () {
        this.sql = '';
    }

    select (...args: Key[]) {
        return this._select(!args.length ? '*' : args.join(','));
    }
    selectDistinct (...args: Key[]) {
        return this._select(`distinct ${args.join(',')}`);
    }

    private _select (str: string) {
        this.reset();
        this.sql = `select ${str} from ${this.tableName}`;
        return this;
    }

    orderBy<T = Key> (...args: T[]) {
        // todo orderby 多个key独立排序
        this.sql += ` order by ${args.join(',')} ASC`;
        return this;
    }
    orderByDesc<T = Key> (...args: T[]) {
        this.sql += ` order by ${args.join(',')} DESC`;
        return this;
    }

    groupBy (name: Key) {
        this.sql += ` group by ${name}`;
        return this;
    }

    insert (data: Partial<Model>) {
        this.reset();
        const keys = Object.keys(data).join(',');
        const values = Object.values(data).map(item => toSqlStr(item)).join(',');
        this.sql = `insert into ${this.tableName}(${keys}) values(${values});`;
        return this;
    }
    /**
    UPDATE table_name
    SET column1 = value1, column2 = value2, ...
    WHERE condition;
    */
    update (data: Partial<Model>) {
        let str = '';
        for (const key in data) {
            str += `,${key}=${toSqlStr(data[key])}`;
        }
        this.sql = `UPDATE ${this.tableName} SET ${str.substring(1)}`;
        return this;
    }

    delete () {
        this.sql = `delete from ${this.tableName} `;
        return this;
    }

    where (conditions?: ICondition<Model>, reverse = false) {
        if (!conditions || !conditions.length) return this;
        this.sql += ` where ${conditions.map((cond: any) => {
            return `(${Object.keys(cond).map(key => {
                const v = cond[key];
                if (v instanceof Array) {
                    // ! array 表示or多个值
                    return v.map(s => `${key}${parseCondContent(s)}`).join(' or ');
                } else {
                    return `${key}${parseCondContent(v)}`;
                }
            }).join(reverse ? ' or ' : ' and ')})`;
        }).join(reverse ? ' and ' : ' or ')}`;
        return this;
    }

    deleteAll () {
        this.sql = `truncate table ${this.tableName}`;
        return this;
    }

    count () {
        this._select('count(*)');
        return this;
    }
    sum (name: Key) {
        this._select(`sum(${name})`);
        return this;
    }
    avg (name: Key) {
        this._select(`avg(${name})`);
        return this;
    }
    min (name: Key) {
        this._select(`min(${name})`);
        return this;
    }
    max (name: Key) {
        this._select(`max(${name})`);
        return this;
    }

    get v () {
        return this.sql;
    }

    page ({
        index = 1,
        size = 10,
    }: ISQLPage = {}) {
        this.sql += ` LIMIT ${size} OFFSET ${index - 1}`;
        return this;
    }
}