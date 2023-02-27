/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-26 15:47:58
 * @Description: Coding something
 */
import { IBaseData } from './sample';

export interface IUser extends IBaseData {
  pwd: string;
  tk: string;
  expire: number;
  nickname: string;
  email: string;
}