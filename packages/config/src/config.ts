/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-05 12:37:25
 * @Description: Coding something
 */

import type { IJson } from 'sener-types';
import { buildSenerDir, deepAssign, formatJson, makedir, parseJson } from 'sener-types';
import path from 'path';
import fs from 'fs';
import type { IConfig, IConfigChange } from './extend';
import Event from 'events';

// export interface IInitialConfigData {
//     filename: string;
//     data: Record<string, any>;
// }
export interface IConfigOptions {
    dir?: string,
    format?: boolean,
    // initial?: IInitialConfigData[],
    initial?: IJson, // 改成json可以进行类型推断
    onchange?: IConfigChange,
}

export class ConfigBase<T = IJson<any>> {
    data: IJson<any> = {};
    baseDir = '';

    event: Event;

    dataProxy: IConfig<T>;

    fileMap: IJson<string> = {};

    format = false;

    constructor ({
        dir = '', format = true, initial = { _default: {} }, onchange
    }: IConfigOptions) {

        // @ts-ignore
        this.dataProxy = { $onChange: (callback) => {this.onConfigChange(callback);} };

        this.format = format;
        this.event = new Event();
        this.baseDir = buildSenerDir('config', dir);

        makedir(this.baseDir);

        this.initFiles(initial);
        if (onchange) {
            this.onConfigChange(onchange);
        }
    }

    private fileNameToPath (file: string) {
        // if (typeof file === 'undefined') console.trace(file);
        const name = file.endsWith('.json') ? file : `${file}.json`;
        return path.join(this.baseDir, name);
    }

    private initFiles (initial: IJson) {

        for (const filename in initial) {
            const data = initial[filename];
            const json = this.readConfigFile(filename, data);

            if (!json) {throw new Error(`Invalid JSON File ${filename}`);}

            const keys = Object.keys(json);
            const properties: IJson = {};
            for (const key of keys) {
                if (key in this.data) {
                    throw new Error(`JSON 中不允许存在重名的配置名: ${filename}.json key=${key}`);
                }
                this.fileMap[key] = filename;
                this.data[key] = json[key];
                properties[key] = {
                    get: () => {
                        // console.log(this.data, '-------)')
                        return this.data[key];
                    },
                    set: (v: any) => {
                        this.writeConfig(key, v);
                    }
                };
            }
            Object.defineProperties(this.dataProxy, properties as any);
            // console.log(this.fileNameToPath(file));
            watchFileChange(this.fileNameToPath(filename), () => {
                // console.log('watchFileChange');
                const json = this.readConfigFile(filename);
                for (const key of keys) {
                    this.onNewValue(key, json[key]);
                }
            });
        }
    }

    onConfigChange (callback: IConfigChange) {
        this.event.on('change', callback);
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
        // console.log('writeConfigChanged', changed, key, v);
        if (changed) {
            // console.log('this.fileMap = ', this.isSingle, this.fileMap);
            const file = this.fileMap[key];
            if (typeof file !== 'string') throw new Error(`Can not find config file: key=${key}`);
            const data = this.readConfigFile(file);
            data[key] = v;
            const str = formatJson(data, this.format);
            fs.writeFileSync(this.fileNameToPath(file), str, 'utf-8');
        }
        return changed;
    }

    private readConfigFile (file: string, initialData: any = null) {
        const filePath = this.fileNameToPath(file);

        if (!fs.existsSync(filePath)) {
            if (!initialData) initialData = {};
            fs.writeFileSync(filePath, formatJson(initialData, this.format), 'utf-8');
            return initialData;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const json = parseJson(content);
        if (!json) {throw new Error(`Invalid JSON File ${file}`);}
        if (initialData) {
            deepAssign(json, initialData);
            const str = formatJson(json, this.format);
            if (str !== content) {
                fs.writeFileSync(filePath, formatJson(initialData, this.format), 'utf-8');
            }
        }
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
        // console.log('json', ov, nv);
        if (isJsonChanged(ov, nv)) {
            return true;
        }
    } else if (ov !== nv) {
        return true;
    }
    return false;
}

function isJsonChanged (old: IJson, newData: IJson): boolean {

    if (Object.keys(old).length !== Object.keys(newData).length) {
        return true;
    }

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
    fs.watchFile(filePath, {
        interval: 5000,
    }, () => {
        // const time = fs.statSync(filePath).mtime;
        // if (last === time) return;
        // last = time;
        change();
    });
}