/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import { IS_DEV, MiddleWare } from 'sener-types';
import type { IJsonHelper } from './extend.d';
import { JsonManager } from './json-manage';
export class Json extends MiddleWare {
    json: JsonManager;
    constructor ({ dir, format = IS_DEV }:{dir?: string, format?: boolean} = {}) {
        super();
        this.json = new JsonManager(dir, format);
    }
    helper (): IJsonHelper {
        return {
            file: (key: string) => this.json.file(key),
            write: (key: string) => this.json.write(key),
            read: (key: string) => this.json.read(key),
            readMap: (key) => this.json.readMap(key),
        };
    }
}
