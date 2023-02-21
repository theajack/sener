/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 22:25:53
 * @Description: Coding something
 */
export * from './json-manage';
export * from './file';
export * from './sync-file';
export * from './utils';

import { File } from './file';
import { JsonManager } from './json-manage';
import { SyncFile } from './sync-file';
import { makedir } from './utils';
import './type.d';

export default {
    JsonManager,
    makedir,
    SyncFile,
    File
};