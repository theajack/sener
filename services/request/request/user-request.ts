/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 01:15:32
 * @Description: Coding something
 */
import { Request, IParsedReturn } from 'packages/rpc/src';

export class UserRequest extends Request {
    // @RequestMethod('/user/login', 'nickname', 'pwd')
    // // @ts-ignore
    // // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    // ll (nickname: string, pwd: string): Promise<IBoolResult & IJson<any>> {}

    login (nickname: string, pwd: string): IParsedReturn {
        return this.postReturn('/user/login', { nickname, pwd });
    }
    sendEmailCode (email: string): IParsedReturn {
        return this.postReturn('/user/emailcode', { email });
    }
    checkToken (tk: string): IParsedReturn {
        return this.postReturn('/user/check', { tk });
    }
}
// (async () => {
//     const aaa = new UserRequest();
//     const a = await aaa.login('11', '22');
//     console.log(a);
//     if (typeof window !== 'undefined') {
//         ((window) as any).aaa = aaa;
//     }
// })();