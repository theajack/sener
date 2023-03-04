/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-05 01:11:02
 * @Description: Coding something
 */

import { ICommonReturn, IMiddleWareEnterData, IPromiseMayBe, MiddleWare } from 'packages/types/src';
import { createServices } from '.';
import { CommentRequest } from './request/comment-request';
import { UserRequest } from './request/user-request';
import { UtilRequest } from './request/util-request';


export interface IServiceHelper {
    services: {
        comment: CommentRequest;
        user: UserRequest;
        util: UtilRequest;
    }
}

declare module 'sener-types-extend' {
    interface ISenerHelper extends IServiceHelper {

    }
}
export class Services extends MiddleWare {
    enter (req: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
        req.services = createServices(req.logger?.traceid || '');
    }
}
