/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:55:55
 * @Description: Coding something
 */
import { Json } from 'packages/json/src';
import { Router } from 'packages/sener';
import { IUser } from 'scripts/samples/types/user';
import hex_md5 from 'scripts/samples/utils/md5';
import { sendEmail } from 'scripts/samples/utils/send-email';
import { generateToken, isTokenExpired } from 'scripts/samples/utils/token';
import { createSimpleTimeInfo, error, generateCode, generateExpired, success } from 'scripts/samples/utils/utils';
import { RequestHandler } from '../../utils/http';
import { initSenerApp } from '../../utils/sample-base';
import { checkEmailCode } from './email';

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
        const { nickname, pwd, email = '', code } = body;
        if (!nickname) return error('昵称不可为空', -1);
        if (!pwd) return error('密码不可为空', -8);

        const emailResult = checkEmailCode(email, code, write);

        if (typeof emailResult === 'object') return emailResult;

        const { data, save, clear, id } = write('user');
        for (const item of data) {
            if (item.nickname === nickname) return emailResult(clear(error('昵称已被注册', -2)));
            if (item.email === email) return emailResult(clear(error('邮箱已被注册', -3)));
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
        emailResult(null, true);
        save();
        return success({ tk: user.tk, expire: user.expire }, '注册登录成功');
    },
    'post:/user/emailcode': async ({ body, write }) => {
        const { email } = body;
        if (!email) return error('邮箱不可为空');
        const min = 5;
        const { time, expire } = generateExpired(min);
        const item = {
            code: generateCode(),
            expire,
        };
        const { result, msg } = await sendEmail({
            title: '【验证码】来自shiyix.cn的验证码',
            message: [
                `验证码: ${item.code}`,
                `有效期: ${min}分钟`,
                `请勿将验证码转发给他人`,
                '-- From shiyix.cn'
            ].join('\n'),
            to: email
        });

        if (!result) {
            return error(`邮件发送失败:${msg}`);
        }
        const { data, save } = write('email');
        if (!data[0]) data[0] = {};
        data[0][email] = item;
        save();
        return success({ time }, '邮件发送成功');
    },
    'post:/user/check': ({ body, read }) => {
        const data = read('user');
        const { tk } = body;
        const user = data.find(u => u.tk === tk) as null | IUser;
        if (!user) return error('错误的token', 1);
        if (isTokenExpired(user)) return error('token已过期', 2, { nickname: user.nickname });
        return success({ id: user.id, tk: user.tk, expire: user.expire }, '认证成功');
    },
    'get:/email': () => {
        sendEmail({
            message: 'from foxmail\nsadasa\nsasa',
            to: 'theajack@qq.com'
        });
        return success({}, '发送成功');
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
