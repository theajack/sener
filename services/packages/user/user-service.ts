/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:55:55
 * @Description: Coding something
 */
import { Config } from 'packages/config/src';
import { Json } from 'packages/json/src';
import { Log } from 'packages/log/src';
import { RPC } from 'packages/rpc/src';
import { Router } from 'packages/sener';
import { IUser } from 'services/types/object.d';
import hex_md5 from 'services/utils/md5';
import { Services } from 'services/utils/request/services-middlleware';
import { generateEmailToken, sendEmail } from 'services/utils/send-email';
import { generateToken, isTokenExpired } from 'services/utils/token';
import { createSimpleTimeInfo, error, generateCode, generateExpired, success } from 'services/utils/utils';
import { initSenerApp } from '../../utils/sample-base';
import { checkEmailCode } from '../util/email';

const router = new Router({
    'post:/user/login': ({ body, write }) => {
        // console.log('body', body);
        const { data, save, clear } = write('user');
        const { nickname, pwd } = body;
        const user = data.find(u => u.nickname === nickname) as null | IUser;
        if (!user) return clear(error('用户不存在', -1));
        // if (!user) return success({ tk: 11, expire: 22 }, '登录成功');
        if (hex_md5(pwd) !== user.pwd) return clear(error('密码错误', -2));
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
        const { email } = body as any;
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
            to: email,
            tk: generateEmailToken()
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
        const data = read<IUser>('user');
        const { tk } = body;
        const user = data.find(u => u.tk === tk);
        if (!user) return error('错误的token', 1);
        if (isTokenExpired(user)) return error('token已过期', 2, { nickname: user.nickname });
        return success({ id: user.id, tk: user.tk, expire: user.expire }, '认证成功');
    },

    '/user/test': async ({ services, logger, rpc, config }) => {
        console.log('xxxxx');
        const data = await rpc.comment.get('/message', { app: 'cnchar', index: 1, size: 10 });
        console.log(data);
        return data;
        // // const level = config.level;
        // logger.log('$$$test1', 'test');

        // logger.log({
        //     msg: '$$$test2',
        //     payload: { a: 1 },
        //     type: 'error',
        //     level: 9,
        //     // extend: { b: 1 }
        // });
        // const data = await services.comment.getList({
        //     app: 'cnchar'
        // });
        // // console.log('------', data);
        // return data;
    }
});

const config = new Config();


const rpc = new RPC({
    comment: 'http://localhost:3001'
});

config.onConfigChange(data => {
    console.log(data);
});

setTimeout(() => {
    config.writeConfig('level', 2);
}, 4000);
initSenerApp({
    port: 3002,
    router,
    middlewares: [
        rpc,
        config,
        new Log({ dir: 'user', level: config.data.level }),
        new Services(),
        new Json({ dir: 'user' }),
    ]
});
