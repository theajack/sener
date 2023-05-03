/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-19 18:03:00
 * @Description: Coding something
 */

export interface IJson<T=any> {
  [prop: string]: T;
}

export type IMethod = 'get'|'post'|'delete'|'put';

export type IServeMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

export type IPromiseMayBe<T> = T|Promise<T>;

export type Instanceof<T> = T extends new(...args: any[]) => infer R ? R : any;