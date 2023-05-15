/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:31
 * @Description: Coding something
 */
import { IJson } from 'sener-types';
import { Request } from './request';

export interface IRPCHelper {
  rpc: IJson<Request>;
}

declare module 'sener' {
  interface ISenerHelper extends IRPCHelper {

  }
}