/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, ISenerContext, makedir, IHookReturn,
} from 'sener-types';
import formidable, { type Part, errors as formidableErrors } from 'formidable-fix';
import path from 'path';
import type IncomingForm from 'formidable-fix/types/Formidable';

export interface IFormOptions {
    dir?: string,
    filename?: (ctx: ISenerContext, name: string, ext: string, part: Part, form: IncomingForm)=>string,
}

export class Form extends MiddleWare {
    dir: string;
    filename: IFormOptions['filename'];

    constructor ({ dir = './public/upload', filename }: IFormOptions = {}) {
        super();
        this.dir = dir;
        this.filename = filename;
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
            const form = formidable({ 
                uploadDir: dir, 
                filename: this.filename ? (name: string, ext: string, part: Part, form: IncomingForm)=> {
                    return this.filename!(ctx, name, ext, part, form)
                }: undefined
            });
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
