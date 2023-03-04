/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 22:24:20
 * @Description: Coding something
 */

import os from 'os';
import path from 'path';
import { IS_DEV } from 'sener-types';

export { now, IS_DEV, makedir } from 'sener-types';

export const BASE_DIR = path.resolve(
    `${IS_DEV ? process.cwd() : os.homedir()}`,
    `./sener-json-db`
);

export function delay (t: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, t);
    });
}