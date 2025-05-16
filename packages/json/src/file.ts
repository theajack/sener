/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 16:58:15
 * @Description: Coding something
 */
import type { IJson } from 'sener-types';
import type { IFileTemplate } from './sync-file';
import { SyncFile } from './sync-file';

export interface IOprateReturn<Model=any> {
    data: Model[]
    map: IJson<Model>;
    save: <T = Promise<boolean>, R extends boolean = false>(
        options?: {data?: Model[], map?: Model, imme?: R}
    ) => (R extends true ? boolean: T),
    clear: <T extends any>(data?: T) => T,
    id: () => number,
    index: () => number,
}

export class File<T=any> extends SyncFile<T> {

    template: IFileTemplate<T>|null;

    opratingCount = 0;

    timer: any = null;

    readTimer: any = null;

    constructor (key: string, path: string, format = false) {
        super(key, path, format);
        // setInterval(() => {
        //     console.log(`key=${key}`, !!this.template);
        // }, 1000);
    }

    read (fromWrite = false): IFileTemplate<T> {
        if (this.template) return this.template;

        if (!fromWrite) {
            if (this.readTimer) clearTimeout(this.readTimer);
            this.readTimer = setTimeout(() => {
                if (this.opratingCount <= 0) this.template = null; // 释放内存
                this.readTimer = null;
            }, 1000);
        }

        // console.log('readPure');
        const template = this.readPure();
        this.template = template;
        return template;
    }

    write (template?: IFileTemplate<T>): boolean {
        const data = template || this.template;
        if (!data) return false;
        // console.log('writePure');
        const result = this.writePure(data);
        // console.log('writePure', result, typeof template, !!this.template, this.opratingCount);
        if (result) {
            if (!template && this.opratingCount <= 0) {
                // console.log(`【debug 】 this.template = null ${this.opratingCount}`);
                this.template = null;
            } // 释放内存
            return true;
        }
        return false;
    }

    oprate (): IOprateReturn<T> {
        if (this.opratingCount < 0) this.opratingCount = 0;

        this.opratingCount ++;
        // console.log('opratingCount++', this.opratingCount);
        const template = this.read(true);

        const writeDone = () => {
            this.opratingCount --;
            // console.log(`【debug 】 opratingCount-- ${this.opratingCount}`);
            if (this.opratingCount > 0) return true; // ! 还有其他请求在操作这个文件暂时不写
            return this.write();
        };

        const timer = setTimeout(writeDone, 5000);

        let index = 0;

        return {
            data: template.data,
            map: template.map,
            // @ts-ignore
            save: ({ data, map, imme = false } = {}) => {
                clearTimeout(timer);
                // console.log('save', this.opratingCount);
                if (data instanceof Array) template.data = data;
                if (map) template.map = map as any; // fix dts error
                if (imme) return writeDone();
                return new Promise<boolean>(resolve => {
                    setTimeout(() => {
                        resolve(writeDone());
                        // console.log(!!this.template);
                    }, 500);
                });
            },
            clear: (data?: any) => {
                clearTimeout(timer);
                this.opratingCount --;
                return data;
            },
            id: () => this.generateId(template),
            index: () => index++
        };
    }
}