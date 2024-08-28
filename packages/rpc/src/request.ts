/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 */
import {
    BaseRequest, type IRequestConsOptions
} from './request-base';
import {
    error, success
} from 'sener-types';
import { request } from './http';


export class Request extends BaseRequest {
    constructor (options: Partial<IRequestConsOptions>) {
        super({
            utils: {
                success,
                error,
                request,
            },
            ...options,
        });
    }
}