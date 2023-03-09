/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-04 22:32:03
 * @Description: Coding something
 */
import path from 'path';
import fs from 'fs';
import { buildSenerDir, dateToString, makedir } from 'sener-types';

export class Saver {
    baseDir = '';
    maxRecords = -1;

    count = 0;

    fileName = '';
    filePath = '';

    content: string = ''; // 写入日志周期内的日志

    level: ()=>number;

    constructor ({
        dir,
        maxRecords = 10000,
        interval = 5000,
        level,
    }: {
        dir: string;
        maxRecords?: number;
        interval?: number;
        level: (()=>number)|number;
    }) {
        this.baseDir = buildSenerDir('log', dir);
        this.level = typeof level === 'number' ? () => level : level;
        makedir(this.baseDir);
        // console.log(this.baseDir);
        this.refreshFileName();
        this.count = this.countLines();
        if (maxRecords < 1000) maxRecords = 1000;
        else if (maxRecords > 100000) maxRecords = 100000;
        this.maxRecords = maxRecords;

        setInterval(() => {
            this.save();
        }, interval); // 间隔一段时间写一次日志（如果有的话）
    }

    save () {
        if (!this.content) return;
        const content = this.content;
        this.content = '';
        fs.appendFileSync(this.filePath, content, 'utf-8');
    }

    addContent (content: string, level = 5) {
        if (level < this.level()) return false;
        this.content += `${content}\n`;
        this.count ++;

        if (this.count >= this.maxRecords) {
            this.save();
            this.count = 0;
        }
        return true;
    }

    refreshFileName () {
        this.fileName = `${dateToString({ type: 'ms', comm: '_' })}.log`;
        this.filePath = path.resolve(this.baseDir, this.fileName);
    }

    countLines () {
        if (!fs.existsSync(this.filePath)) return 0;

        const result = fs.readFileSync(this.filePath, 'utf-8').match(/\n/g);

        if (!result) return 0;

        return result.length + 1;
    }
}