/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-25 13:43:28
 * @Description: Coding something
 */
import { now } from 'packages/types';
import { IUser } from '../types/object';
import md5 from './md5';
import tokenKey from './ignore/token.ignore';

// {userId} {password} {expiresTime} {tokenKey}

export enum TokenState {
  Valid,
  Error,
  Expired,
}

export function generateToken (
    user: IUser,
    ExpiresTime = 86400000 // 默认1天有效期 86400000 ms
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