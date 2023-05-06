/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IPromiseMayBe, ICommonReturn,
    IMiddleWareRequestData,
    IJson,
} from 'sener-types';

// todo 增加内置正则和过滤器

interface IFormatMap {
    'number': number;
    'string': string;
    'boolean': boolean;
}

export type IValidFormat = keyof IFormatMap;
export type IValidRule = 'required' | 'optional' | RegExp | ((v: any, formatValue: any) => boolean);

type ITemplate = {
    [prop in string]: IValidFormat | [IValidFormat, IValidRule];
}

type IValidFunc = <
    D extends ITemplate = ITemplate
>(template: D) => {
    // @ts-ignore
    [prop in keyof D]: IFormatMap[(D[prop] extends string ? D[prop]: D[prop][0])];
}

interface IValidatorHelper {
    vquery: IValidFunc;
    vbody: IValidFunc;
}

declare module 'sener-types-extend' {
    interface ISenerHelper extends IValidatorHelper {}
}

export class Validator extends MiddleWare {

    private _validate (template: ITemplate, data: IJson<any>) {

        const result: any = {};
        for (const k in template) {

            const v = template[k];
            const isArr = v instanceof Array;
            const format: IValidFormat = isArr ? v[0] : v;
            const rule: IValidRule = isArr ? v[1] : 'optional';

            const value = data[k];
            const type = typeof value;
            result[k] = value;
            // console.log(k, format, value, type, parseFloat(value));
            if (format === 'string' ) {
                if (type !== 'string') result[k] = value.toString();
            } else if (format === 'number') {
                if (type !== 'number') result[k] = parseFloat(value);
            } else if (format === 'boolean') {
                if (type !== 'boolean') result[k] = typeof value === 'string' ? (value === 'true') : (!!value);
            }
            // todo 增加其他 format

            if (rule !== 'optional') {
                let error = '';
                // todo 增加其他 rule
                if (rule === 'required') {
                    if (typeof value === 'undefined') error = `Property '${k}' is Reqiored`;
                } else if (typeof rule === 'function') {
                    if (!rule(value, result[k])) error = `Property '${k}' is Invalid`;
                } else if (rule instanceof RegExp) {
                    if (!rule.test(value.toString())) error = `Property '${k}' is Invalid`;
                }
                if (error) {
                    throw new Error(`Validator Fail: ${error}`);
                }
            }
        }
        return result;
    }

    enter (res: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn> {
        const { query, body } = res;
        console.log('valudator enter', query, body);
        res.vquery = (template: ITemplate) => {
            return this._validate(template, query);
        };
        res.vbody = (template: ITemplate) => {
            console.log('vbody', query, body);
            return this._validate(template, body);
        };
        // const data = res.vquery({
        //     user: 'string',
        //     size: [ 'boolean', 'required' ]
        // });

        // data.size;
    }

}
