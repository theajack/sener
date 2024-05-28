/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, ISenerContext, IJson,
} from 'sener-types';

// todo 增加内置正则和过滤器

interface IFormatMap {
    'number': number;
    'string': string;
    'boolean': boolean;
    'any': any;
}

export type IValidFormat = keyof IFormatMap;
export type IValidRule = 'required' | 'optional' | RegExp | ((v: any, formatValue: any) => boolean);

export type IValidTemplate = {
    [prop in string]: IValidFormat | [IValidFormat, IValidRule];
}

type IValidFunc = <
    D extends IValidTemplate = IValidTemplate
>(template: D) => ({
    // @ts-ignore
    [prop in keyof D]: IFormatMap[(D[prop] extends string ? D[prop]: D[prop][0])];
} & {
    [prop in string]: any;
});

interface IValidatorHelper {
    vquery: IValidFunc;
    vbody: IValidFunc;
    validate: <
        D extends IValidTemplate = IValidTemplate
    >(data: IJson, template: D) => ({
        // @ts-ignore
        [prop in keyof D]: IFormatMap[(D[prop] extends string ? D[prop]: D[prop][0])];
    });
}

declare module 'sener-extend' {
    interface ISenerHelper extends IValidatorHelper {}
}

export class Validator extends MiddleWare {

    private _validate (template: IValidTemplate, data: IJson<any>) {

        const result: any = { ...data };
        for (const k in template) {

            const value = result[k];
            const type = typeof value;

            const v = template[k];
            const isArr = v instanceof Array;
            const format: IValidFormat = isArr ? v[0] : v;
            const rule: IValidRule = isArr ? v[1] : 'optional';


            // console.log(k, format, value, type, parseFloat(value));
            if (format === 'string' ) {
                if (type !== 'string') result[k] = value.toString();
            } else if (format === 'number') {
                if (type !== 'number') result[k] = parseFloat(value);
            } else if (format === 'boolean') {
                if (type !== 'boolean') result[k] = type === 'string' ? (value === 'true') : (!!value);
            }
            // todo 增加其他 format

            if (rule !== 'optional') {
                let error = '';
                // todo 增加其他 rule
                if (rule === 'required') {
                    if (type === 'undefined') error = `Property '${k}' is Required`;
                } else if (typeof rule === 'function') {
                    if (!rule(value, result[k])) error = `Property '${k}' is Invalid`;
                } else if (rule instanceof RegExp) {
                    if (!rule.test(value.toString())) error = `Property '${k}' is Invalid`;
                }
                if (error) {
                    console.log(`Validator Fail: ${error}`);
                    throw new Error(`Validator Fail: ${error}`);
                }
            }
        }
        return result;
    }

    init (res: ISenerContext) {
        const { query, body } = res;
        // console.log('validator enter', query, body);
        res.vquery = (template: IValidTemplate) => {
            return this._validate(template, query);
        };
        res.vbody = (template: IValidTemplate) => {
            return this._validate(template, body);
        };
        res.validate = (data, template: IValidTemplate) => {
            return this._validate(template, data);
        };
        // const data = res.vquery({
        //     user: 'string',
        //     size: [ 'boolean', 'required' ]
        // });

        // data.size;
    }

}

