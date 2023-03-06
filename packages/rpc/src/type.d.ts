/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:28:27
 * @Description: Coding something
 */

export interface IRouterReturn<TObject=any> {
    code: number;
    data: TObject;
    msg?: string;
}

export interface IBoolResult {
  success: boolean;
  msg?: string;
}