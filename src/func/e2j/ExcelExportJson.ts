import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import P, { join } from 'path'
import xlsx from 'node-xlsx'

export namespace e2j {
    let outputDir: string;
    let outPutInfo: any[];

    export function exportJson(config: any): any[] {
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
                    parseExcel(pa, P.basename(path, ex));
            }
        });
    }

    function getVal(type: string, v: any): any {
        // console.log(type, v);
        if (v == 'undefined') return null;
        switch (type) {
            case 'str':
            case 'arr':
                return v != undefined ? String(v) : null;
            case 'float':
            case 'num':
            case 'int':
                if (v != undefined) {
                    let a: any = Number(v);
                    if (isNaN(a)) a = String(v);
                    return a;
                } else return null;
            // case 'arr':
            //     return v ? String(v).split(',') : [];
        }
    };

    function getType(type: string) {
        switch (type) {
            case 'str':
            case 'arr':
                return 'string';
            case 'float':
            case 'num':
            case 'int':
                return 'number';
            default: return 'string';
        }
    }

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
        var tsContent: string[] = [];
        sheets.forEach((sheet: any) => {
            console.log('parseSheet', sheet.name);
            if (sheet.name.indexOf('!') == 0) return;
            var o: any;
            var len = sheet.data.length;
            var descs = [];
            var names = [];
            var types = [];
            var regexs = [];
            var hasId = false;
            var need = [];
            for (var i = 0; i < len; i++) {
                var row = sheet.data[i];
                var l = i > 1 ? names.length : row.length;
                var data: any = {};
                for (var j = 0; j < l; j++) {
                    var cell = String(row[j]).trim();
                    if (i == 0) {//第0行是描述
                        descs.push(cell);
                    }
                    else if (i == 1) {//第一行是字段名
                        if (cell == '' || cell == null) break;
                        names.push(cell);
                        if (cell.toLowerCase() == 'id') {
                            hasId = true;
                            o = new Object();
                        }
                    } else if (i == 2) {//第二行是字段属性
                        types.push(cell);
                    } else if (i == 3) {//第三行是0需要导出，1不需要导出
                        need.push(cell)
                    } else if (i == 4) {//第四行是正则表达式
                        regexs.push(cell);
                    } else {
                        //当id为空时
                        if (j == 0 && cell == 'undefined') continue;

                        if (need[j] == 'both' || need[j] == 'client' || need[j] == '0') {
                            var nn = names[j];
                            var type = types[j];
                            var regex = regexs[j];
                            data[nn] = getVal(type, cell);
                            if (sheet.name == 'level!等级表')
                                console.log(type, cell, data[nn]);
                            if (nn.toLowerCase() == 'id') {
                                o[data[nn]] = data;
                            }
                            if (regex != 'undefined' && !match(String(cell), regex)) {
                                outPutInfo.push({ dir: `数据格式不匹配：文件${name} 表${sheet.name} 字段${nn} 第${i + 1}行`, name: name, state: 0 });
                            }
                        }
                    }
                }
                if (!hasId && i > 3) {
                    o = o || new Array();
                    o.push(data);
                }
            }
            json[sheet.name.split('!')[0]] = o;
            tsContent.push(createDataInterface(names, types, descs, sheet.name));
        });
        name = name.split('!')[0];
        var dest = outputDir + '/' + name + '.json';
        writeFileSync(dest, JSON.stringify(json), 'utf8');
        outPutInfo.push({ dir: dest, name: name, state: 1 });

        tsContent.unshift(`export namespace ${name} {`);
        tsContent.push(`}`);
        writeFileSync(outputDir + '/' + name + '.d.ts', tsContent.join('\n'), 'utf8');
    }

    // 生成TypeScript接口文件
    function createDataInterface(names: string[], types: string[], descs: string[], name: string) {
        const n = name.split('!');
        var content = `\t/**${n[1]}*/\n`;
        content += `\texport type ${n[0]} = {
        [key: number]: ${n[0]}Data
    };\n`;
        content += `\texport type ${n[0]}Data = {\n`;
        for (var i = 0; i < names.length; i++) {
            content += `\t\t/** ${descs[i]} */\n`;
            content += `\t\t${names[i]}: ${getType(types[i])};\n`;
        }
        content += `\t};`;
        return content;
    }

    //将字符串首字母大写
    function firstUpperCase(str: string) {
        return str.replace(/^\S/, s => s.toUpperCase());
    }
}