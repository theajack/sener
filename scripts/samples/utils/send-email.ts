/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-28 08:51:51
 * @Description: Coding something
 */
import { SMTPClient } from 'emailjs';
import { ShiyixConfig } from './ignore/email-token';

const client = new SMTPClient({
    user: ShiyixConfig.fromEmail, // 你的QQ用户
    password: ShiyixConfig.emailCode, // 这里是上面生成的授权码，不是QQ密码
    host: ShiyixConfig.emailHost, // 主机，不改
    ssl: true // 开启ssl
});

export function sendEmail ({
    title = '标题',
    message = '内容',
    to,
}: {
  title?: string;
  message: string;
  to: string;
}): Promise<{result: boolean, msg: string}> {
    return new Promise(resolve => {
        console.log({
            text: message, // 邮件内容
            from: ShiyixConfig.fromEmail, // 你的邮箱号
            to, // 发送给谁的
            subject: title // 邮件主题
        });
        // 开始发送邮件
        client.send({
            text: message, // 邮件内容
            from: ShiyixConfig.fromEmail, // 你的邮箱号
            to, // 发送给谁的
            subject: title // 邮件主题

        }, function (err) {
            console.log(err);
            if (!err) {
                resolve({ result: true, msg: '发送通知邮件成功' });
            } else {
                resolve({ result: false, msg: err.message });
            }
        });
    });
};