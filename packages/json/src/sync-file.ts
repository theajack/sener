/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 15:58:26
 * @Description: Coding something
 */
import { BASE_DIR, now, makedir } from './utils';
import fs from 'fs';
import path from 'path';

export interface IFileTemplate {
    key: string,
    data: any[], // 数据集
    id: number, // 索引
    count: number, // 数据大小
    lastUpdateTime: number, // 上次更新时间
    createTime: number
}

export function extractKey (path: string) {
    return path.substring(BASE_DIR.length, path.length - 5);
}

export function keyToPath (key: string): string {
    return path.resolve(BASE_DIR, `./${key}.json`);
}

// 同步模块
export class SyncFile {

    path: string;

    dir: string;

    key: string;

    isDirExist: boolean;
    isFileExist: boolean;

    constructor (key: string) {
        this.key = key;
        this.path = keyToPath(key);
        // this.path = path;
        // this.key = extractKey(path);
        this.dir = this.path.substring(0, this.path.lastIndexOf('/') + 1);
        this.isDirExist = fs.existsSync(this.dir);
        this.isFileExist = this.isDirExist && fs.existsSync(this.path);
    }

    readPure (): IFileTemplate {
        if (!this.isFileExist)
            return this.generateDefaultData();
        try {
            const content = fs.readFileSync(this.path, 'utf8');
            const result = JSON.parse(content);
            // console.log('read content', result.middle, Object.keys(result).length);
            return result;
        } catch (e) {
            return this.generateDefaultData();
        }
    }

    generateId (data: IFileTemplate) {
        return ++ data.id;
    }

    generateDefaultData (data: any[] = []): IFileTemplate {
        const time = now();
        return {
            key: this.key,
            data, // 数据集
            id: 0, // 索引
            count: 0, // 数据大小
            lastUpdateTime: time, // 上次更新时间
            createTime: time
        };
    }

    private updateInfo (data: IFileTemplate) {
        data.lastUpdateTime = now();
        data.count = data.data.length;
    }

    writePure (data: IFileTemplate) {
        if (!this.isDirExist) {
            makedir(this.dir);
            this.isDirExist = true;
        }
        this.updateInfo(data);
        try {
            fs.writeFileSync(this.path, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {
            return false;
        }
        if (!this.isFileExist) this.isFileExist = true;
        return true;
    }

    oprateSync (
        handleData: (data: any[], geneId: (data: IFileTemplate) => number) => any[]
    ) {
        const template = this.readPure();
        template.data = handleData(template.data, () => this.generateId(template));
        return this.writePure(template);
    }

}