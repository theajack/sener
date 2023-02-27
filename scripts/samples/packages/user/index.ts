/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:55:55
 * @Description: Coding something
 */
import { Json } from 'packages/json/src';
import { Router } from 'packages/sener';
import { IUser } from 'scripts/samples/types/user';
import hex_md5 from 'scripts/samples/utils/md5';
import { generateToken, isTokenExpired, isTokenValid } from 'scripts/samples/utils/token';
import { createSimpleTimeInfo, error, success } from 'scripts/samples/utils/utils';
import { RequestHandler } from '../../utils/http';
import { initSenerApp } from '../../utils/sample-base';

const request = new RequestHandler({
    port: 3001
});

const json = new Json('user');


const router = new Router({
    'post:/user/login': ({ body, write }) => {
        const { data, save, clear } = write('user');
        const { nickname, pwd } = body;
        const user = data.find(u => u.nickname === nickname) as null | IUser;
        if (!user) return clear(error('用户不存在', 1));
        if (hex_md5(pwd) !== user.pwd) return clear(error('密码错误', 2));
        generateToken(user);
        save();
        return success({ tk: user.tk, expire: user.expire }, '登录成功');

    },
    'post:/user/regist': ({ body, write }) => {
        const { data, save, clear, id } = write('user');
        const { nickname, pwd, email = '' } = body;
        if (data.find(u => u.nickname === nickname)) {
            return clear(error('昵称不可用'));
        }
        const user: IUser = {
            ...createSimpleTimeInfo(),
            id: id(),
            pwd: hex_md5(pwd),
            email,
            expire: 0,
            nickname,
            tk: '',
        };
        generateToken(user);
        data.unshift(user);
        save();
        return success({ tk: user.tk, expire: user.expire }, '注册登录成功');
    },
    'post:/user/check': ({ body, read }) => {
        const data = read('user');
        const { tk } = body;
        const user = data.find(u => u.tk === tk) as null | IUser;
        if (!user) return error('错误的token', 1);
        if (isTokenExpired(user)) return error('token已过期', 2, { nickname: user.nickname });
        return success({ id: user.id, tk: user.tk, expire: user.expire }, '认证成功');
    },

    '/user/test': () => {
        return request.get('/message', {
            all: true,
            app: 'cnchar',
        });
    }
});

initSenerApp({
    port: 3002,
    router,
    json
});
