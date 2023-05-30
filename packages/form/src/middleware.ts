/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, ISenerContext, makedir, IHookReturn,
} from 'sener-types';
import formidable, { errors as formidableErrors } from 'formidable-fix';
import path from 'path';

export class Form extends MiddleWare {
    dir: string;

    constructor ({ dir = './public/upload' }: {dir?: string} = {}) {
        super();
        this.dir = dir;
    }

    private getUploadDir (): string {
        const date = new Date();
        const m = date.getMonth() + 1;
        const str = `${date.getFullYear()}_${m < 10 ? '0' : ''}${m}`;
        const dir = path.resolve(process.cwd(), this.dir, str);
        makedir(dir);
        return dir;
    }

    init (ctx: ISenerContext): IHookReturn {
        // console.log('Form enter', ctx.requestHeaders['content-type']);
        const { request, requestHeaders, method, responseJson } = ctx;

        if (!requestHeaders['content-type']?.includes('multipart/form-data') || method !== 'POST') return;
        return new Promise(resolve => {
            const dir = this.getUploadDir();
            const form = formidable({ uploadDir: dir });
            form.parse(request, (err, formData, files) => {
                // console.log('Form parsed:', dir, formData, files);
                if (err) {
                    // example to check for a very specific error
                    const data = (err.code === formidableErrors.maxFieldsExceeded) ?
                        responseJson({ code: -1, data: { msg: 'maxFieldsExceeded' } }) :
                        responseJson({ code: -2, data: { code: err.code, msg: err.toString() } }, 400);
                    resolve(data);
                } else {
                    resolve({ formData, files });
                }
            });
        });
    }
}
