/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 15:19:55
 * @Description: Coding something
 */
import fs from 'fs';
import path from 'path';

// @ts-ignore
export function mstat (dir, originFiles, callback) {
    const files = originFiles.slice(0);
    // @ts-ignore
    const stats = [];

    const file = files.shift();

    if (file) {
        fs.stat(path.join(dir, file), function (e, stat) {
            if (e) {
                callback(e);
            } else {
                // @ts-ignore
                mstat(files, stats.concat([ stat ]));
            }
        });
    } else {
        callback(null, {
            // @ts-ignore
            size: stats.reduce(function (total, stat) {
                return total + stat.size;
            }, 0),
            // @ts-ignore
            mtime: stats.reduce(function (latest, stat) {
                return latest > stat.mtime ? latest : stat.mtime;
            }, 0),
            // @ts-ignore
            ino: stats.reduce(function (total, stat) {
                return total + stat.ino;
            }, 0)
        });
    }
};
