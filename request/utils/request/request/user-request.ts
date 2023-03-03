/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 01:15:32
 * @Description: Coding something
 */
import { IBoolResult } from 'request/types/sample';
import { Request } from './base-request';

export class UserRequest extends Request {
    constructor () {
        super({ port: 3002 });
    }

    async login (nickname: string, pwd: string) {
        const result = await this.post('/user/login', {
            nickname, pwd
        });
        return this.parseResult(result);
    }

    async sendEmailCode (email: string) {
        const { data } = await this.post('/user/emailcode', {
            email
        });
        const { data: result, code, msg } = data;
        return {
            success: code === 0,
            msg,
            ...result,
        };
    }

    async checkToken (token: string): Promise<IBoolResult> {
        const { data } = await this.post('/user/check', {
            tk: token
        });
        return {
            success: data?.code === 0,
            msg: data?.msg
        };
    }
}