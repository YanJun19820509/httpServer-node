import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import P, { join } from 'path'
import xlsx from 'node-xlsx'

export namespace e2ts {
    let outputDir: string;
    let outPutInfo: any[];

    export function exportTs(config: any): any[] {
        outPutInfo = [];
        outputDir = join(config.excelsDir, '.output');
        if (!existsSync(outputDir)) mkdirSync(outputDir);
        searchDir(config.excelsDir);
        return outPutInfo;
    }

    function searchDir(dir: string) {
        let paths = readdirSync(dir);
        paths.forEach((path: string) => {
            if (path == '.output') return;
            let pa = P.join(dir, path);
            let s = statSync(pa);
            if (s.isDirectory()) searchDir(pa);
            else if (path.indexOf('~$') == -1) {
                let ex = P.extname(path);
                if (ex == '.xlsx' || ex == '.xls')
                    parseExcel2(pa, P.basename(path, ex));
            }
        });
    }

    function getVal(type: string, v: any): any {
        switch (type) {
            case 'str':
                if (v == 'undefined') return '';
                return String(v || '');
            case 'num':
                if (v == 'undefined') return 0;
                return v != undefined ? Number(v) : null;
            case 'arr':
                if (v == 'undefined') return [];
                return v ? String(v).split(',') : [];
        }
    };

    function match(conten: string, regex: string): boolean {
        let r = new RegExp(regex);
        return r.test(conten);
    }

    function parseExcel(file: string, name: string) {
        if (name.indexOf('!') == 0) return;
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
            var regexs = [];
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
                    } else if (i == 3) {//第三行是正则表达式
                        regexs.push(cell);
                    } else {
                        var nn = names[j];
                        var type = types[j];
                        var regex = regexs[j];
                        // console.log(name, type, cell);
                        data[nn] = getVal(type, cell);
                        if (nn == 'id') {
                            o[data[nn]] = data;
                        }
                        if (regex != 'undefined' && !match(String(cell), regex)) {
                            outPutInfo.push(`数据格式不匹配：文件${name} 表${sheet.name} 字段${nn} 第${i + 1}行`);
                        }
                    }
                }
                if (!hasId && i > 3) {
                    o = o || new Array();
                    o.push(data);
                }
            }
            json[sheet.name.split('!')[0]] = o;
        });
        name = name.split('!')[0];
        var dest = outputDir + '/' + name + '.ts';
        writeFileSync(dest, `const ${name} = ${json}`, 'utf8');
        outPutInfo.push({ dir: dest, name: name });
    }

    function parseExcel2(file: string, name: string) {
        if (name.indexOf('!') == 0) return;
        console.log('parseExcel2', file);
        let buffer = readFileSync(file);
        var sheets = xlsx.parse(buffer);
        var json: any = {};
        var errInfo: string[] = [];
        sheets.forEach((sheet: any) => {
            // console.log('parseSheet', sheet.name);
            if (sheet.name.indexOf('!') == 0) return;
            var o: any[] = [];
            var len = sheet.data.length;
            var names = [];
            var types = [];
            var regexs = [];
            for (var i = 1; i < len; i++) {
                var row = sheet.data[i];
                var l = i > 1 ? names.length : row.length;
                var data: any[] = [];
                for (var j = 0; j < l; j++) {
                    var cell = String(row[j]).trim();
                    if (i == 1) {//第一行是字段名
                        if (cell == '' || cell == null) break;
                        names.push(cell);
                        data.push(cell);
                    } else if (i == 2) {//第二行是字段属性
                        types.push(cell);
                    } else if (i == 3) {//第三行是正则表达式
                        regexs.push(cell);
                    } else {
                        var type = types[j];
                        var regex = regexs[j];
                        data[data.length] = getVal(type, cell);
                        if (cell == 'undefined') continue;
                        if (regex != 'undefined' && !match(String(cell), regex)) {
                            errInfo.push(`数据格式不匹配：表${sheet.name} 字段${names[j]} 第${i + 1}行`);
                        }
                    }
                }

                if (i == 1 || i > 3) {
                    let isEnd = true;
                    for (let ii = 0, nn = data.length; ii < nn; ii++) {
                        if (data[ii] != null) {
                            isEnd = false;
                            o[o.length] = data;
                            break;
                        }
                    }
                    if (isEnd) break;
                }
            }
            json[sheet.name.split('!')[0]] = o;
        });
        name = name.split('!')[0];
        var dest = outputDir + '/' + name + '.json';
        writeFileSync(dest, JSON.stringify(json), 'utf8');
        outPutInfo.push({ dir: dest, name: name, err: JSON.stringify(errInfo) });
    }
}