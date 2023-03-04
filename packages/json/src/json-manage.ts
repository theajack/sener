/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 17:19:03
 * @Description: Coding something
 */
import fs from 'fs';
import { BASE_DIR, makedir } from './utils';
import { File } from './file';
import path from 'path';

export class JsonManager {
    private files: Record<string, File> = {};

    baseDir = BASE_DIR;

    format = false;

    constructor (dir = '', format = false) {
        if (dir) {
            this.baseDir = path.resolve(BASE_DIR, dir);
            // if (fs.existsSync(this.baseDir)) {
            //     throw new Error(`Dir is Exist: ${this.baseDir}`);
            // }
        }
        this.format = format;
        makedir(this.baseDir);

        traverse(this.baseDir, path => {
            const key = this.extractKey(path);
            // console.log(key);
            this.files[key] = new File(key, path, format);
        });

    }
    write (key: string) {
        return this.file(key).oprate();
    }
    file (key: string) {
        // console.log('files key', key, Object.keys(this.files));
        if (!this.files[key]) {
            this.files[key] = new File(key, this.keyToPath(key), this.format);
        }
        return this.files[key];
    }
    read (key: string) {
        return this.file(key).read().data;
    }
    readMap (key: string) {
        return this.file(key).read().map;
    }

    extractKey (path: string) {
        return path.substring(this.baseDir.length + 1, path.length - 5);
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
            onSingleFile(path.resolve(dir, name));
        } else {
            traverse(path.resolve(dir, name), onSingleFile);
        }
    }
}