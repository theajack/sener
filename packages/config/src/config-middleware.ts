/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import { MiddleWare } from 'sener-types';
import { ConfigBase, IConfigOptions } from './config';
import { IConfigChange, IConfigHelper } from './extend';

export class Config extends MiddleWare {

    constructor (options: IConfigOptions = {}) {
        super();
        this.config = new ConfigBase(options);
    }

    private config: ConfigBase;

    get data () {
        return this.config.dataProxy;
    }
    onConfigChange (callback: IConfigChange) {
        this.config.onConfigChange(callback);
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
