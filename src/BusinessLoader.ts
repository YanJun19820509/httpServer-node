import { readdirSync, statSync } from "fs";
import P from "path";
import { utils } from "./utils";

export default class BusinessLoader {
    public static load() {
        businessPathRoot.forEach(dir => {
            this.searchDir(utils.resolvePath(dir));
        });
    }

    private static searchDir(dir: string) {
        let log: any = { [dir]: [] };
        let paths = readdirSync(dir);
        paths.forEach(path => {
            let pa = P.join(dir, path);
            let s = statSync(pa);
            if (s.isDirectory()) this.searchDir(pa);
            else if (P.extname(path) == '.ts') {
                log[dir].push(path);
                this.loadFile(pa);
            }
        });
        console.log('BusinessLoader load:', log);
    }

    private static loadFile(file: string) {
        require(file);
    }
}
//需要加载的业务模块根目录
let businessPathRoot = [
    'src/bus'
];