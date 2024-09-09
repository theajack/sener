import { parseCondContent, toSqlStr, wrapKey } from './cond';

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
    Model extends Record<string, any> = Record<string, any>,
    Key = (keyof Model),
> {
    private tableName: string;

    private sql: string = '';

    constructor (tableName: string) {
        this.tableName = tableName;
        this.reset();
    }

    private reset () {
        this.sql = '';
    }


    select (...args: (Key|1)[]) {
        return this._select(!args.length ? '*' : this._joinKeys(args));
    }
    selectDistinct (...args: (Key|1)[]) {
        return this._select(`distinct ${this._joinKeys(args)}`);
    }

    private _joinKeys(args: any[]){
        let s = '';
        for(let v of args){
            s += `,${(this._key(v))}`;
        }
        return s.substring(1);
    }
    private _key = wrapKey;

    private _select (str: string) {
        this.reset();
        this.sql = `select ${str} from ${this._key(this.tableName)}`;
        return this;
    }

    orderBy<T = Key> (...args: T[]) {
        // todo orderby 多个key独立排序
        this.sql += ` order by ${this._joinKeys(args)} ASC`;
        return this;
    }
    orderByDesc<T = Key> (...args: T[]) {
        this.sql += ` order by ${this._joinKeys(args)} DESC`;
        return this;
    }

    groupBy (name: Key) {
        this.sql += ` group by ${this._key(name)}`;
        return this;
    }

    insert (data: Partial<Model>) {
        this.reset();
        const keys = this._joinKeys(Object.keys(data));
        const values = Object.values(data).map(item => toSqlStr(item)).join(',');
        this.sql = `insert into ${this._key(this.tableName)}(${keys}) values(${values});`;
        return this;
    }
    /**
    UPDATE table_name
    SET column1 = value1, column2 = value2, ...
    WHERE condition;
    */
    update (data: {
        [prop in keyof Model]?: Model[prop]|string
    }) {
        let str = '';
        for (const key in data) {
            str += `,${this._key(key)}=${toSqlStr(data[key])}`;
        }
        this.sql = `UPDATE ${this._key(this.tableName)} SET ${str.substring(1)}`;
        return this;
    }

    delete () {
        this.sql = `delete from ${this._key(this.tableName)} `;
        return this;
    }

    // ! reverse true 表示 内层json表or，外层数组表 and
    where (conditions?: ICondition<Model>, reverse = false) {
        if (!conditions || !conditions.length) return this;

        // console.log('where', conditions)
        const whereInner = conditions.map((cond: any) => {
            return `(${Object.keys(cond).map(key => {
                const v = cond[key];
                if (v instanceof Array) {
                    // ! array 表示or多个值
                    return v.map(s => `${this._key(key)}${parseCondContent(s)}`).join(' or ');
                } else {
                    return `${this._key(key)}${parseCondContent(v)}`;
                }
            }).join(reverse ? ' or ' : ' and ')})`;
        }).join(reverse ? ' and ' : ' or ');

        if(whereInner.length <= 2) return this;

        this.sql += ` where ${whereInner}`;
        return this;
    }

    deleteAll () {
        this.sql = `truncate table ${this._key(this.tableName)}`;
        return this;
    }

    count () {
        this._select('count(1)');
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

    toString(){
        let v = this.sql;
        this.reset();
        return v;
    }

    page ({
        index = 1,
        size = 10,
    }: ISQLPage = {}) {
        return this.limit(size).offset((index - 1) * 10)
    }

    limit(v: number){
        this.sql += ` LIMIT ${v}`;
        return this;
    }
    offset(v: number){
        if(v <= 0) return this;
        this.sql += ` OFFSET ${v}`;
        return this;
    }
}