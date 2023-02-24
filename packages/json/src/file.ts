/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 16:58:15
 * @Description: Coding something
 */
import { SyncFile, IFileTemplate } from './sync-file';


export interface IOprateReturn {
    data: any[]
    save: () => void,
    clear: () => void,
    id: () => number,
}

export class File extends SyncFile {

    template: IFileTemplate|null;

    opratingCount = 0;

    isReading = false;

    // todo 逻辑可以再思考优化一下
    read (): IFileTemplate {
        if (this.template) return this.template;
        this.isReading = true;
        const template = this.readPure();
        this.template = template;
        this.isReading = false;
        return template;
    }

    write (template?: IFileTemplate): boolean {
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
        handleData: (data: any[], geneId: () => number) => Promise<any[]>|any[],
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

    private reduceCount () {

    }

    oprateCustom (): IOprateReturn {

        this.opratingCount ++;
        const template = this.read();
        return {
            data: template.data,
            save: (data?: any[]) => {
                if (data instanceof Array) template.data = data;
                this.opratingCount --;
                // console.log(`【debug 】 opratingCount-- ${this.opratingCount}`);
                if (this.opratingCount > 0) return true;
                return this.write();
            },
            clear: () => {this.opratingCount --;},
            id: () => this.generateId(template),
        };
    }
}