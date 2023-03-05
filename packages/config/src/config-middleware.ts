/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import { IS_DEV, MiddleWare } from 'sener-types';
import { ConfigBase } from './config';
import { IConfigChange, IConfigHelper } from './extend';

export class Config extends MiddleWare {

    constructor ({
        dir = '', file = 'default', format = IS_DEV,
    }: {dir?: string, file?: string|string[], format?: boolean} = {}) {
        super();
        this.config = new ConfigBase({
            dir,
            files: typeof file === 'string' ? [ file ] : file,
            format,
        });
    }

    private config: ConfigBase;

    get data () {
        return this.config.dataProxy;
    }
    onConfigChange (callback: IConfigChange) {
        this.config.event.on('change', callback);
    }

    writeConfig (key: string, v: any): boolean {
        return this.config.writeConfig(key, v);
    }

    helper (): IConfigHelper {
        return {
            config: this.config.dataProxy,
            writeConfig: (key, v) => this.writeConfig(key, v),
            onConfigChange: (callback) => {
                this.onConfigChange(callback);
            }
        };
    }
}
