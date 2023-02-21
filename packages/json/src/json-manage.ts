/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 17:19:03
 * @Description: Coding something
 */
import fs from 'fs';
import { BASE_DIR, makedir } from './utils';
import { extractKey } from './sync-file';
import { File, IOprateReturn } from './file';

export class JsonManager {
    private files: Record<string, File> = {};

    json: (key: string) => IOprateReturn;
    file: (key: string) => File;

    constructor () {

        makedir(BASE_DIR);

        traverse(BASE_DIR, path => {
            const key = extractKey(path);
            this.files[key] = new File(key);
        });

        this.json = (key: string) => {
            return this.file(key).oprateCustom();
        };
        this.file = (key: string) => {
            // console.log(!!this.files[key]);
            if (!this.files[key]) {
                this.files[key] = new File(key);
            }
            return this.files[key];
        };
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