/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 01:15:32
 * @Description: Coding something
 */
import { IParsedReturn, Request } from 'packages/rpc/src';

export class UtilRequest extends Request {

    email (to: string, message: string, title: string, tk: string): IParsedReturn {
        return this.postReturn('/util/email', { title, message, to, tk });
    }

    async uploadImage (...files: File[]) {
        if (typeof FormData === 'undefined') throw new Error('No FormData');
        const formData = new FormData();
        let length = 0;
        files.forEach((file, index) => {
            if (!file) return;
            length ++;
            formData.append('' + index, file);
        });
        if (length === 0) return { success: false, msg: '文件为空' };
        const data = await this.postForm('/util/img/upload', formData);
        try {
            const files = data.data.data.files;
            const list: {filepath: string, originalFilename: string, size: number}[] = [];
            for (const k in files) {
                list[k as any] = files[k];
            }
            return {
                files: list,
                success: true,
                msg: data.data.msg
            };
        } catch (e) {
            return {
                success: false,
                msg: e.message,
            };
        }
    }

    getStat (name: string, type: string): IParsedReturn {
        return this.getReturn('/util/stat', { name, type });
    }

    stat (name: string, type: string): IParsedReturn {
        return this.postReturn('/util/stat', { name, type });
    }

}