/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-09 08:39:39
 * @Description: Coding something
 */
declare module 'ebuild-cli' {
    function init(url: string, options?: {
        name?: string;
        description?: string;
        author?: string;
    }): Promise<any>;
}