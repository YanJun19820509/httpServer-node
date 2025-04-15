import { execFileSync, execSync } from "child_process";
import { copyFileSync, mkdirSync, readFileSync } from "fs";
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

    /**
     * 执行可执行文件
     * @param file 
     * @returns 
     */
    export function execFile(file: string, args: string[]): string {
        return execFileSync(file, args, { encoding: 'utf8' });
    }

    /**
     * 执行命令行
     * @param cmd 
     * @returns 
     */
    export function execCommand(cmd: string): string {
        return execSync(cmd, { encoding: 'utf-8' });
    }

    /**
     * 创建目录
     * @param path 
     */
    export function makeDir(path: string) {
        mkdirSync(path, {
            recursive: true
        });
    }

    export function copy(from: string, to: string) {
        copyFileSync(from, to);
    }
}