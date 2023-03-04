/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-02 23:56:16
 * @Description: Coding something
 */

import { CommentRequest } from './request/comment-request';
import { UserRequest } from './request/user-request';
import { UtilRequest } from './request/util-request';

export function createServices (traceid = '') {
    const host = 'localhost';
    const base = '';
    return {
        comment: new CommentRequest({ host, base, port: 3001, traceid }),
        user: new UserRequest({ host, base, port: 3002, traceid }),
        util: new UtilRequest({ host, base, port: 3003, traceid }),
    };
}

export const ServiceHelper = createServices();

