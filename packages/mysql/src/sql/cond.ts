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

export function toSqlStr (v: any) {
    return (typeof v === 'string') ? `'${v}'` : v.toString();
}
export const Cond = {
    // 用数组区分处理过
    eq (v: any) {
        // ♩
        return [ `=${toSqlStr(v)}` ];
    },
    notEq (v: any) {
        return [ `<>${toSqlStr(v)}` ];
    },
    gt (v: any) {
        return [ `>${v}` ];
    },
    lt (v: any) {
        return [ `<${v}` ];
    },
    gte (v: any) {
        return [ `>=${v}` ];
    },
    lte (v: any) {
        return [ `<=${v}` ];
    },
    bt (v1: any, v2: any) {
        return [ `between ${v1} and ${v2}` ];
    },
    in (...vs: any[]) {
        return [ `in (${vs.map(v => toSqlStr(v)).join(',')})` ];
    },
    /**
% 表示多个字值，_ 下划线表示一个字符；
M% : 为能配符，正则表达式，表示的意思为模糊查询信息为 M 开头的。
%M% : 表示查询包含M的所有内容。
%M_ : 表示查询以M在倒数第二位的所有内容
     */
    like (v: string) {
        return `like ${v}`;
    },
    null () {
        return `is null`;
    },
    notNull () {
        return 'is not null';
    }
};