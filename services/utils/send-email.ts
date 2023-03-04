/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-28 08:51:51
 * @Description: Coding something
 */
import { SMTPClient } from 'emailjs';
import { ShiyixConfig } from './ignore/email-token';
import tokenIgnore from './ignore/token.ignore';
import hex_md5 from './md5';
import { getDateMinString } from './utils';

const client = new SMTPClient({
    user: ShiyixConfig.fromEmail, // 你的QQ用户
    password: ShiyixConfig.emailCode, // 这里是上面生成的授权码，不是QQ密码
    host: ShiyixConfig.emailHost, // 主机，不改
    ssl: true // 开启ssl
});

export function generateEmailToken () {
    return hex_md5(getDateMinString() + tokenIgnore);
}

export function sendEmail ({
    title = '标题',
    message = '内容',
    to,
    tk,
}: {
  title?: string;
  message: string;
  to: string;
  tk: string;
}): Promise<{result: boolean, msg: string}> {

    if (tk !== generateEmailToken()) {
        return Promise.resolve({ result: false, msg: '鉴权失败' });
    }

    return new Promise(resolve => {
        // console.log({
        //     text: message, // 邮件内容
        //     from: ShiyixConfig.fromEmail, // 你的邮箱号
        //     to, // 发送给谁的
        //     subject: title // 邮件主题
        // });
        // 开始发送邮件
        // console.log('message', message, title, to);

        client.send({
            from: ShiyixConfig.fromEmail,
            to,
            subject: title,
            text: message,
        }, function (err) {
            if (!err) {
                resolve({ result: true, msg: '发送通知邮件成功' });
            } else {
                resolve({ result: false, msg: err.message });
            }
        });

        // client.send({
        //     text: message, // 邮件内容
        //     from: ShiyixConfig.fromEmail, // 你的邮箱号
        //     to, // 发送给谁的
        //     subject: title // 邮件主题

        // }, function (err) {
        //     if (!err) {
        //         resolve({ result: true, msg: '发送通知邮件成功' });
        //     } else {
        //         resolve({ result: false, msg: err.message });
        //     }
        // });
    });
};