/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 16:26:52
 * @Description: Coding something
 */

export function now () {
    return Date.now();
}

export function random (a: number, b: number) {
    return (a + Math.round(Math.random() * (b - a)));
};

export function parseJSON (data: any): Record<string, any>|any[]|null {
    if (typeof data === 'object') {return data;}
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

