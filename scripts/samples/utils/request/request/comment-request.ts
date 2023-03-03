/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 01:15:32
 * @Description: Coding something
 */
import { Request } from './base-request';

export class CommentRequest extends Request {
    constructor () {
        super({ port: 3001 });
    }

    async getList ({ app = 'common', index = 1 }: {
        app?: string
        index?: number
    } = {}) {
        const data = await this.get('/message', {
            app,
            index,
            size: 10,
        });
        // console.log('getList', data);
        return data;
    }
}