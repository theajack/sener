/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-26 15:48:07
 * @Description: Coding something
 */
export interface IBaseTimeData {
  ct: number; // createTime
  ut: number; // updateTime
}

export interface IBaseData extends IBaseTimeData {
  id: number;
}

export interface IRouterReturn<TObject=any> {
  code: number;
  data: TObject;
  msg?: string;
}

export interface IEmail {
  title: string;
  message: string;
  to: string;
}

export interface IBoolResult {
  success: boolean;
  msg?: string;
}