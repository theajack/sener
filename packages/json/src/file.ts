/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 16:58:15
 * @Description: Coding something
 */
import { SyncFile, IFileTemplate } from './sync-file';


export interface IOprateReturn<Model=any> {
    data: Model[]
    save: (data?: Model[]) => void,
    clear: <T extends any>(data?: T) => T,
    id: () => number,
}

export class File<T=any> extends SyncFile<T> {

    template: IFileTemplate<T>|null;

    opratingCount = 0;

    isReading = false;

    read (): IFileTemplate<T> {
        if (this.template) return this.template;
        this.isReading = true;
        const template = this.readPure();
        this.template = template;
        this.isReading = false;
        return template;
    }

    write (template?: IFileTemplate<T>): boolean {
        const data = template || this.template;
        if (!data) return false;
        const result = this.writePure(data);
        if (result) {
            if (!template && this.opratingCount <= 0) {
                // console.log(`【debug 】 this.template = null ${this.opratingCount}`);
                this.template = null;
            } // 释放内存
            return true;
        }
        return false;
    }

    async oprate (
        handleData: (data: T[], geneId: () => number) => Promise<T[]>|T[],
    ): Promise<boolean> {
        try {
            this.opratingCount ++;
            const template = this.read();
            // console.log(`【debug 】 asyncRead ${!!template}`);
            const data = await handleData(template.data, () => this.generateId(template));
            if (data instanceof Array) template.data = data;
            this.opratingCount --;
            // console.log(`【debug 】 opratingCount-- ${this.opratingCount}`);

            if (this.opratingCount > 0) return true;
            return this.write();
        } catch (e) {
            this.opratingCount --;
            return false;
        }
    }

    oprateCustom (): IOprateReturn<T> {
        if (this.opratingCount < 0) this.opratingCount = 0;

        this.opratingCount ++;
        // console.log('opratingCount++', this.opratingCount);
        const template = this.read();

        const writeDone = () => {
            this.opratingCount --;
            // console.log(`【debug 】 opratingCount-- ${this.opratingCount}`);
            if (this.opratingCount > 0) return true; // ! 还有其他请求在操作这个文件暂时不写
            return this.write(template);
        };

        const timer = setTimeout(writeDone, 5000);

        return {
            data: template.data,
            save: (data?: T[]) => {
                clearTimeout(timer);
                console.log('save', this.opratingCount);
                if (data instanceof Array) template.data = data;
                return writeDone();
            },
            clear: (data?: any) => {
                clearTimeout(timer);
                this.opratingCount --;
                return data;
            },
            id: () => this.generateId(template),
        };
    }
}