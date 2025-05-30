/*
 * @Author: chenzhongsheng
 * @Date: 2024-01-17 23:29:30
 * @Description: Coding something
 *
    =	等于
    <>	不等于。注释：在 SQL 的一些版本中，该操作符可被写成 !=
    >	大于
    <	小于
    >=	大于等于
    <=	小于等于
    BETWEEN	在某个范围内
    LIKE	搜索某种模式
    IN	指定针对某个列的多个可能值
 */
export const MagicCode = '$%*&^!@+';
const MN = MagicCode.length;

export function checkMagicCode (v: string) {
    if (v.substring(0, MN) === MagicCode) {
        return [ true, v.substring(MN) ];
    }
    return [ false, v ];
}

export function toSqlStr (v: any) {
    if (typeof v === 'string') {
        const [ is, str ] = checkMagicCode(v);
        return is ? str : `'${str}'`;
    }
    return v.toString();
}


export function parseCondContent (v: any) {
    if (typeof v === 'string') {
        const [ is, str ] = checkMagicCode(v);
        return is ? str : `='${str}'`;
    }
    return `=${v.toString()}`;
}

function _ (v: string) {
    return `${MagicCode}${v}`;
}

export const Cond = {
    // 用数组区分处理过
    eq (v: any) {
        // ♩
        return _(`=${toSqlStr(v)}`);
    },
    notEq (v: any) {
        return _(`<>${toSqlStr(v)}`);
    },
    gt (v: any) {
        return _(`>${v}`);
    },
    lt (v: any) {
        return _(`<${v}`);
    },
    gte (v: any) {
        return _(`>=${v}`);
    },
    lte (v: any) {
        return _(`<=${v}`);
    },
    bt (v1: any, v2: any) {
        return _(` between ${v1} and ${v2}`);
    },
    in (vs: any[]) {
        return _(` in (${vs.map(v => toSqlStr(v)).join(',')})`);
    },
    /**
% 表示多个字值，_ 下划线表示一个字符；
M% : 为能配符，正则表达式，表示的意思为模糊查询信息为 M 开头的。
%M% : 表示查询包含M的所有内容。
%M_ : 表示查询以M在倒数第二位的所有内容
     */
    like (v: string, padding = true) {
        return _(` like '${padding ? `%${v}%` : v}'`);
    },
    null () {
        return _(` is null`);
    },
    notNull () {
        return _(' is not null');
    },
};

export const Calc = {
    add (attr: string, num: number) {
        if (num < 0) {
            return this.reduce(attr, -num);
        }
        return _(`${attr}+${num}`);
    },
    reduce (attr: string, num: number) {
        return _(`${wrapKey(attr)}-${num}`);
    }
};

const _keyReg = /^[a-zA-Z][a-zA-Z_0-9]*$/;
export function wrapKey (v: any) {
    return _keyReg.test(v) ? `\`${v}\`` : v;
}