
export interface IJson<T=any> {
  [prop: string]: T;
}

export type IMethod = 'get'|'post'|'delete'|'put';

export type IServeMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type IPromiseMayBe<T> = T|Promise<T>;