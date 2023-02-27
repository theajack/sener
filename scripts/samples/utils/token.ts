/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-25 13:43:28
 * @Description: Coding something
 */
import { now } from 'packages/sener/src/utils';
import { IUser } from '../types/user';
import md5 from './md5';
import tokenKey from './token.ignore';

// {userId} {password} {expiresTime} {tokenKey}

export enum TokenState {
  Valid,
  Error,
  Expired,
}

export function generateToken (
    user: IUser,
    ExpiresTime = 10000 // 默认1天有效期
) {
    user.expire = now() + ExpiresTime;
    user.tk = md5(`${user.id} ${user.pwd} ${user.expire} ${tokenKey}`);
    return user;
}

export function isTokenValid (
    user: IUser,
    tk: string
): TokenState {
    if (now() > user.expire) return TokenState.Expired;
    if (user.tk === tk) return TokenState.Valid;
    return TokenState.Error;
}
export function isTokenExpired (
    user: IUser
): boolean {
    if (now() > user.expire) return true;
    return false;
}