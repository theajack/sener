import { IOprateReturn } from 'packages/json/src';
import { error, isExpired } from 'scripts/samples/utils/utils';

/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-01 08:36:31
 * @Description: Coding something
 */
export function checkEmailCode (
    email: string,
    code: string,
    write: (key: string) => IOprateReturn
) {

    if (!email) return error('邮箱不可为空', -4);
    if (!code) return error('验证码不可为空', -5);

    const { data, clear, save } = write('email');

    const emailData = data[0][email];

    if (!emailData || !emailData.code || emailData.code !== code) {
        return clear(error('验证码错误', -6));
    }
    if (isExpired(emailData.expired)) {
        console.log('11111111111');
        delete data[0][email];
        save();
        return error('验证码已过期', -7);
    }

    return (passData: any, needSave = false) => {
        if (needSave) {
            console.log('11111111111');
            delete data[0][email];
            save();
        } else {
            clear();
        }
        return passData;
    };
}