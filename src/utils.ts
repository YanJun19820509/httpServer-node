import { readFileSync } from "fs";
import { parse } from "jsonc-parser";
import P from 'path';

export namespace utils {
    /** 读取工程json文件 */
    export function readJson(path: string): any {
        let buffer = readFileSync(P.join(process.cwd(), path), 'utf8');
        let config = parse(buffer);
        return config;
    }

    /** 获取相对于项目根目录的绝对路径 */
    export function resolvePath(path: string): string {
        return P.join(process.cwd(), path);
    }
}