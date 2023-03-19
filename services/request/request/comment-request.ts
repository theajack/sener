/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 01:15:32
 * @Description: Coding something
 */

import { IRequestReturn, Request } from 'packages/rpc';

export class CommentRequest extends Request {

    async getList ({ app = 'common', index = 1 }: {
        app?: string
        index?: number
    } = {}): IRequestReturn {
        const data = await this.get('/message', {
            app,
            index,
            size: 10,
        });
        // console.log('getList', data);
        return data;
    }
}