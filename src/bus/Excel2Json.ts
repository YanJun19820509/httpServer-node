import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../../src/table/GameTable";
import { IBusiness, register } from "../../src/BusinessInterface";
import { e2j } from "../../src/func/e2j/ExcelExportJson";
import { utils } from "../../src/utils";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { parse } from "jsonc-parser";
import { basename, join } from "path";

@register('/json/:type')
class Excel2Json implements IBusiness {

    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        switch (ctx.params.type) {
            case 'export_json': {
                if (param.id == undefined) {
                    ctx.redirect('/');
                    return;
                }
                let t = GameTable.ins;
                let c = await t.select(`id = ${param.id}`);
                t.close();
                // console.log('更新excels', c[0].excelsDir)
                // utils.execFile(utils.resolvePath('svn1.bat'), [c[0].excelsDir]);
                console.log(utils.execCommand(`svn update "${c[0].excelsDir}"`));
                let message = e2j.exportJson(c[0]);
                return ctx.render('export-json-result', { result: message, id: param.id });
            }
            case 'copy_json': {
                if (param.id == undefined) {
                    ctx.redirect('/');
                    return;
                }
                let t = GameTable.ins;
                let c = (await t.select(`id = ${param.id}`))[0];
                t.close();
                let root = param.copyTo == '0' ? c.root : c.rootDev;
                let branch = param.copyTo == '0' ? c.branch : c.branchDev;
                let names: string[] = [].concat(param.selectedName),
                    files: string[] = [].concat(param.selectedFile);

                let destBuffer = readFileSync(c.jsonOutputConfigFile, 'utf8');
                let destConfig = parse(destBuffer);

                let defaultDest: string[], defaultCompressDest: string[] | undefined, fileDest: any, fileCompressDest: string[] | undefined, DefaultDtsDest: string[] | undefined;
                destConfig.forEach((c: { dest: string[], compress?: string[], files?: string[], dts?: string[] }) => {
                    if (!c.files) {
                        defaultDest = c.dest;
                        defaultCompressDest = c.compress;
                        DefaultDtsDest = c.dts;
                    } else {
                        fileCompressDest = c.compress;
                        fileDest = fileDest || {};
                        c.files.forEach((file: string) => {
                            fileDest[file] = c.dest;
                        });
                    }
                });
                console.log('names---->', names, DefaultDtsDest);
                let message: string[] = [];
                names.forEach((name, i) => {
                    let dests: string[] = fileDest?.[name], compressDests: string[] | undefined;
                    if (!dests) {
                        dests = defaultDest;
                        compressDests = defaultCompressDest;
                    } else {
                        compressDests = fileCompressDest;
                    }
                    dests.forEach(dir => {
                        var dest = join(root, dir, name + '.json');
                        message[message.length] = dest;
                        copyFileSync(files[i], dest);
                    });
                    if (compressDests) {
                        compressDests.forEach(dir => {
                            var dest = join(root, dir, name + '.json');
                            compress(files[i], dest);
                        });
                    }
                    if (DefaultDtsDest) {
                        DefaultDtsDest.forEach(dir => {
                            var dest = join(root, dir, name + '.d.ts');
                            copyFileSync(files[i].replace('.json', '.d.ts'), dest);
                        });
                    }
                });

                for (let i = 0, n = message.length; i < n; i += 7) {
                    let a = [root, branch, message[i]];
                    if (message[i + 1]) a[a.length] = message[i + 1];
                    if (message[i + 2]) a[a.length] = message[i + 2];
                    if (message[i + 3]) a[a.length] = message[i + 3];
                    if (message[i + 4]) a[a.length] = message[i + 4];
                    if (message[i + 5]) a[a.length] = message[i + 5];
                    if (message[i + 6]) a[a.length] = message[i + 6];
                    // if (message[i + 7]) a[a.length] = message[i + 7];
                    console.log('a------->', a)
                    utils.execFile(utils.resolvePath('git.bat'), a);
                }

                return ctx.render('result', { result: '提交成功', url: '/gm/info', id: param.id });
            }
        }
    }
}


const cc = 94;

function compress(path: string, to: string) {
    let data: any[] = [];
    // const name = basename(path, '.json');
    const con = readFileSync(path, { encoding: 'utf8' });
    const json = JSON.parse(con);
    // console.log(json)
    let tables: any = {};
    for (const tableName in json) {
        tables[tableName] = parseTableProperties(json[tableName], data);
    }
    var d = { tables: tables, data: data.join(String.fromCharCode(cc)) };
    // fs.writeFileSync('./assets/resources/config/' + name + '.bin', data.join(','), 'binary');
    writeFileSync(to, JSON.stringify(d));
    // copyFileSync(path.replace('.json', '.d.ts'), to.replace('.json', '.d.ts'));
}

function parseTableProperties(d: any, data: any[]) {
    let ids: string[] = [], properties: string[] = [], offset = data.length;
    for (const id in d) {
        ids[ids.length] = id;
        if (!properties.length) {
            properties = Object.keys(d[id]);
        }
        for (const key in d[id]) {
            data[data.length] = d[id][key];
        }
    }
    return { ids: ids.join(String.fromCharCode(cc)), properties: properties.join(String.fromCharCode(cc)), offset: offset };
}