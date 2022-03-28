import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import P from 'path'
import xlsx from 'node-xlsx'
import { parse } from 'jsonc-parser';

export namespace e2j {
    let defaultDest: string[], fileDest: any;
    let outPutInfo: string[];

    export function exportJson(config: any): string[] {
        outPutInfo = [];
        setJsonDest(config.jsonOutputConfigFile);
        searchDir(config.excelsDir);
        return outPutInfo;
    }

    function setJsonDest(configFile: string) {
        let destBuffer = readFileSync(configFile, 'utf8');
        let destConfig = parse(destBuffer);
        destConfig.forEach((c: { dest: string[], files?: string[] }) => {
            if (!c.files) defaultDest = c.dest;
            else {
                fileDest = fileDest || {};
                c.files.forEach((file: string) => {
                    fileDest[file] = c.dest;
                });
            }
        });
    }

    function searchDir(dir: string) {
        let paths = readdirSync(dir);
        paths.forEach((path: string) => {
            let pa = P.join(dir, path);
            let s = statSync(pa);
            if (s.isDirectory()) searchDir(pa);
            else if (path.indexOf('~$') == -1) {
                let ex = P.extname(path);
                if (ex == '.xlsx' || ex == '.xls')
                    parseExcel(pa, P.basename(path, ex));
            }
        });
    }

    function getVal(type: string, v: any): any {
        // console.log(type, v);
        switch (type) {
            case 'str':
                return String(v || '');
            case 'num':
                return v != undefined ? Number(v) : null;
            case 'arr':
                return v ? String(v).split(',') : [];
        }
    };

    function parseExcel(file: string, name: string) {
        console.log('parseExcel', file);
        let buffer = readFileSync(file);
        var sheets = xlsx.parse(buffer);
        var json: any = new Object();
        sheets.forEach((sheet: any) => {
            console.log('parseSheet', sheet.name);
            if (sheet.name.indexOf('!') == 0) return;
            var o: any;
            var len = sheet.data.length;
            var names = [];
            var types = [];
            var hasId = false;
            for (var i = 1; i < len; i++) {
                var row = sheet.data[i];
                var l = i > 1 ? names.length : row.length;
                var data: any = {};
                for (var j = 0; j < l; j++) {
                    var cell = String(row[j]).trim();
                    if (i == 1) {//第一行是字段名
                        if (cell == '' || cell == null) break;
                        names.push(cell);
                        if (cell == 'id') {
                            hasId = true;
                            o = new Object();
                        }
                    } else if (i == 2) {//第二行是字段属性
                        types.push(cell);
                    } else {
                        if (cell == 'undefined') continue;
                        var name = names[j];
                        var type = types[j];
                        // console.log(name, type, cell);
                        data[name] = getVal(type, cell);
                        if (name == 'id') {
                            o[data[name]] = data;
                        }
                    }
                }
                if (!hasId && i > 0) {
                    o = o || new Array();
                    o.push(data);
                }
            }
            json[sheet.name.split('!')[0]] = o;
        });

        let dests: string[] = fileDest?.[name] || defaultDest;
        dests.forEach(dir => {
            var dest = dir + '/' + name + '.json';
            writeFileSync(dest, JSON.stringify(json), 'utf8');
            outPutInfo.push(`导出json：${dest}`);
        });
    }
}