/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import type { IJson } from 'sener-types';
import type { Request } from './request';

export interface IRPCHelper {
  rpc: IJson<Request>;
}

declare module 'sener-extend' {
  interface ISenerHelper extends IRPCHelper {

  }
}