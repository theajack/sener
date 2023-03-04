/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 15:58:26
 * @Description: Coding something
 */
import { now, makedir } from './utils';
import fs from 'fs';
import { IJson } from 'sener-types';

export interface IFileTemplate<T=any> {
    key: string,
    data: T[], // 数据集
    map: IJson<T>,
    id: number, // 索引
    count: number, // 数据大小
    lastUpdateTime: number, // 上次更新时间
    createTime: number
}

// 同步模块
export class SyncFile<T=any> {

    path: string;

    dir: string;

    key: string;

    isDirExist: boolean;
    isFileExist: boolean;

    format = false;

    constructor (key: string, path: string, format = false) {
        this.format = format;
        this.key = key;
        this.path = path;
        this.dir = this.path.substring(0, this.path.lastIndexOf('/') + 1);
        this.isDirExist = fs.existsSync(this.dir);
        this.isFileExist = this.isDirExist && fs.existsSync(this.path);
    }

    readPure (): IFileTemplate<T> {
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

    generateId (data: IFileTemplate<T>) {
        return ++ data.id;
    }

    generateDefaultData (data: T[] = []): IFileTemplate<T> {
        const time = now();
        return {
            key: this.key,
            data, // 数据集
            id: 0, // 索引
            count: 0, // 数据大小
            lastUpdateTime: time, // 上次更新时间
            createTime: time,
            map: {} as IJson<T>
        };
    }

    private updateInfo (data: IFileTemplate<T>) {
        data.lastUpdateTime = now();
        data.count = data.data.length;
    }

    writePure (data: IFileTemplate<T>) {
        if (!this.isDirExist) {
            makedir(this.dir);
            this.isDirExist = true;
        }
        this.updateInfo(data);
        try {
            const content = this.format ? JSON.stringify(data, null, 2) : JSON.stringify(data);
            fs.writeFileSync(this.path, content, 'utf8');
        } catch (e) {
            return false;
        }
        if (!this.isFileExist) this.isFileExist = true;
        return true;
    }

    oprateSync (
        handleData: (data: T[], geneId: (data: IFileTemplate<T>) => number) => T[]
    ) {
        const template = this.readPure();
        template.data = handleData(template.data, () => this.generateId(template));
        return this.writePure(template);
    }

}