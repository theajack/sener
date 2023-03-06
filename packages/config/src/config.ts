/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-05 12:37:25
 * @Description: Coding something
 */

import { buildSenerDir, formatJson, IJson, makedir, parseJson } from 'sener-types';
import path from 'path';
import fs from 'fs';
import { IConfig } from './extend';
import Event from 'events';

const BASE_DIR = buildSenerDir('config');

export class ConfigBase {
    baseDir = BASE_DIR;
    data: IJson<any> = {};

    event: Event;

    dataProxy: IConfig = {};

    fileMap: string | IJson<string> = '';

    get isSingle () {
        return typeof this.fileMap === 'string';
    }

    format = false;

    constructor ({
        dir, files, format
    }: {dir: string, files: string[], format: boolean}) {

        this.format = format;
        this.event = new Event();
        if (dir) this.baseDir = path.resolve(BASE_DIR, dir);

        makedir(this.baseDir);

        const defaultFile = this.fileNameToPath('default');

        if (!fs.existsSync(defaultFile)) {
            fs.writeFileSync(defaultFile, '{}', 'utf-8');
        }

        this.initFiles(files);
    }

    private fileNameToPath (file: string) {
        // if (typeof file === 'undefined') console.trace(file);
        return path.join(this.baseDir, file + '.json');
    }

    private initFiles (files: string[]) {

        this.fileMap = files.length === 1 ? files[0] : {};

        files.forEach(file => {

            const json = this.readConfigFile(file, true);

            if (!json) {throw new Error(`Invalid JSON File ${file}`);}

            const keys = Object.keys(json);

            for (const key of keys) {
                if (key in this.data) {
                    throw new Error(`JSON 中不允许存在重名的配置名: ${file}.json key=${key}`);
                }
                if (!this.isSingle) (this.fileMap as any)[key] = file;
                this.data[key] = json[key];
                this.dataProxy[key] = (v?: any) => {
                    if (typeof v === 'undefined') {
                        return this.data[key];
                    }
                    this.writeConfig(key, v);
                };
            }
            // console.log(this.fileNameToPath(file));
            watchFileChange(this.fileNameToPath(file), () => {
                // console.log('watchFileChange');
                const json = this.readConfigFile(file);
                for (const key of keys) {
                    this.onNewValue(key, json[key]);
                }
            });
        });
    }

    private onNewValue (key: string, nv: any) {
        if (isValueChanged(this.data[key], nv)) {
            this.event.emit('change', { key, value: nv, prev: this.data[key] });
            this.data[key] = nv;
            return true;
        }
        return false;
    }

    writeConfig (key: string, v: any) {
        const changed = this.onNewValue(key, v);
        // console.log('writeConfigChanged', changed);
        if (changed) {
            // console.log('this.fileMap = ', this.isSingle, this.fileMap);
            const file: string = this.isSingle ? this.fileMap : (this.fileMap as any)[key];
            if (typeof file !== 'string') throw new Error(`Can not find config file: key=${key}`);
            let data: any = null;
            if (this.isSingle) {
                data = this.data;
            } else {
                data = this.readConfigFile(file);
                data[key] = v;
            }
            const str = formatJson(data, this.format);
            fs.writeFileSync(this.fileNameToPath(file), str, 'utf-8');
        }
        return changed;
    }
    private readConfigFile (file: string, checkExist = false) {
        const filePath = this.fileNameToPath(file);

        if (checkExist && !fs.existsSync(filePath)) {
            throw new Error(`配置文件不存在: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const json = parseJson(content);
        if (!json) {throw new Error(`Invalid JSON File ${file}`);}
        return json;
    }
}


function isValueChanged (ov: any, nv: any) {
    const ntype = typeof nv;
    const otype = typeof ov;

    if (ntype !== otype) {
        return true;
    }

    if (nv && ntype === 'object') {
        if (isJsonChanged(ov, nv)) {
            return true;
        }
    } else if (ov !== nv) {
        return true;
    }
    return false;
}

function isJsonChanged (old: IJson, newData: IJson): boolean {
    for (const key in old) {
        const nv = newData[key];
        const ov = old[key];
        if (nv && typeof nv === 'object') {
            if (isJsonChanged(ov, nv)) {
                return true;
            }
        } else if (nv !== ov) {
            return true;
        }
    }
    return false;
}

function watchFileChange (filePath: string, change: ()=>void) {

    // let last = fs.statSync(filePath).mtime;
    fs.watch(filePath, () => {
        // const time = fs.statSync(filePath).mtime;
        // if (last === time) return;
        // last = time;
        change();
    });
}