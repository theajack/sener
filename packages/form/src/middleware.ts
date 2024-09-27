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
    subDir?: string|((ctx: ISenerContext)=>(string|undefined)),
    filename?: (ctx: ISenerContext, name: string, ext: string, part: Part, form: IncomingForm)=>string,
}

export class Form extends MiddleWare {
    dir: string;
    filename: IFormOptions['filename'];
    subDir: IFormOptions['subDir'];

    constructor ({ dir = './public/upload', subDir, filename }: IFormOptions = {}) {
        super();
        this.dir = dir;
        this.subDir = subDir;
        this.filename = filename;
    }

    private getUploadDir (ctx: ISenerContext): string {

        let str: any = null;

        const sub = this.subDir;

        if(typeof sub !== 'undefined'){
            str = typeof sub === 'string' ? sub: sub(ctx);
        }
        if(typeof str !== 'string'){
            const date = new Date();
            const m = date.getMonth() + 1;
            str = `${date.getFullYear()}_${m < 10 ? '0' : ''}${m}`;
        }
        const dir = path.resolve(process.cwd(), this.dir, str);
        makedir(dir);
        return dir;
    }

    init (ctx: ISenerContext): IHookReturn {
        // console.log('Form enter', ctx.requestHeaders['content-type']);
        const { request, requestHeaders, method, responseJson } = ctx;

        if (!requestHeaders['content-type']?.includes('multipart/form-data') || method !== 'POST') return;
        return new Promise(resolve => {
            const dir = this.getUploadDir(ctx);
            const form = formidable({
                uploadDir: dir,
                filename: this.filename ? (name: string, ext: string, part: Part, form: IncomingForm) => {
                    return this.filename!(ctx, name, ext, part, form);
                } : undefined
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
