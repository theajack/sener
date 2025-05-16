/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import type { ServerOptions } from 'http-proxy';

declare module 'sener-extend' {
  interface ISenerHelper {
    proxy: (options: ServerOptions) => void;
  }
}