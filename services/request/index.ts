/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-02 23:56:16
 * @Description: Coding something
 */

import { CommentRequest } from './request/comment-request';
import { UserRequest } from './request/user-request';
import { UtilRequest } from './request/util-request';

export function createServices (traceid = '') {
    const base = (port: number) => `http://localhost:${port}`;
    return {
        comment: new CommentRequest({ base: base(3001), traceid }),
        user: new UserRequest({ base: base(3002), traceid }),
        util: new UtilRequest({ base: base(3003), traceid }),
    };
}

export type IServices = ReturnType<typeof createServices>;

export const ServiceHelper = createServices();

