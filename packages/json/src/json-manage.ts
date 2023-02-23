/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 17:19:03
 * @Description: Coding something
 */
import fs from 'fs';
import { BASE_DIR, makedir } from './utils';
import { File, IOprateReturn } from './file';
import path from 'path';

export class JsonManager {
    private files: Record<string, File> = {};

    json: (key: string) => IOprateReturn;
    file: (key: string) => File;

    baseDir = BASE_DIR;

    constructor (dir = '') {
        if (dir) {
            this.baseDir = path.resolve(BASE_DIR, dir);
            // if (fs.existsSync(this.baseDir)) {
            //     throw new Error(`Dir is Exist: ${this.baseDir}`);
            // }
        }
        makedir(this.baseDir);

        traverse(this.baseDir, path => {
            const key = this.extractKey(path);
            this.files[key] = new File(key, path);
        });

        this.json = (key: string) => {
            return this.file(key).oprateCustom();
        };
        this.file = (key: string) => {
            // console.log(!!this.files[key]);
            if (!this.files[key]) {
                this.files[key] = new File(key, this.keyToPath(key));
            }
            return this.files[key];
        };
    }

    extractKey (path: string) {
        return path.substring(this.baseDir.length, path.length - 5);
    }

    keyToPath (key: string): string {
        return path.resolve(this.baseDir, `./${key}.json`);
    }
}

function traverse (
    dir: string,
    onSingleFile: (path: string) => void
) {
    const list = fs.readdirSync(dir);

    for (const name of list) {
        if (name.endsWith('.json')) {
            onSingleFile(`${dir}${name}`);
        } else {
            traverse(`${dir}${name}/`, onSingleFile);
        }
    }
}