/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import { MiddleWare } from 'sener-types';
import { JsonManager } from './json-manage';

export class Json extends MiddleWare {
    json: JsonManager;
    constructor () {
        super();
        this.json = new JsonManager();
    }
    helper () {
        return {
            file: (key: string) => this.json.file(key),
            json: (key: string) => this.json.json(key),
        };
    }
}
