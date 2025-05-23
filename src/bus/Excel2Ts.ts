import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../table/GameTable";
import { IBusiness, register } from "../BusinessInterface";
import { utils } from "../utils";
import { copyFileSync, readFileSync } from "fs";
import { parse } from "jsonc-parser";
import { join } from "path";
import { e2ts } from "../func/e2ts/ExcelExportTs";

@register('/json/:type')
class Excel2Ts implements IBusiness {

    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        switch (ctx.params.type) {
            case 'export_ts': {
                let t = GameTable.ins;
                let c = await t.select(`id = ${param.id}`);
                t.close();
                utils.execFile(utils.resolvePath('svn.bat'), [c[0].excelsDir]);
                let message = e2ts.exportTs(c[0]);
                return ctx.render('export-json-result', { result: message, id: param.id });
            }
            case 'copy_ts': {
                let t = GameTable.ins;
                let c = (await t.select(`id = ${param.id}`))[0];
                t.close();
                let root = param.copyTo == '0' ? c.root : c.rootDev;
                let names: string[] = [].concat(param.selectedName),
                    files: string[] = [].concat(param.selectedFile);

                let destBuffer = readFileSync(c.jsonOutputConfigFile, 'utf8');
                let destConfig = parse(destBuffer);

                let defaultDest: string[], fileDest: any;
                destConfig.forEach((c: { dest: string[], files?: string[] }) => {
                    if (!c.files) defaultDest = c.dest;
                    else {
                        fileDest = fileDest || {};
                        c.files.forEach((file: string) => {
                            fileDest[file] = c.dest;
                        });
                    }
                });

                let message: string[] = [];
                names.forEach((name, i) => {
                    let dests: string[] = fileDest?.[name] || defaultDest;
                    dests.forEach(dir => {
                        var dest = join(root, dir, name + '.ts');
                        message[message.length] = dest;
                        copyFileSync(files[i], dest);
                    });
                });

                for (let i = 0, n = message.length; i < n; i += 8) {
                    let a = [root, message[i]];
                    if (message[i + 1]) a[a.length] = message[i + 1];
                    if (message[i + 2]) a[a.length] = message[i + 2];
                    if (message[i + 3]) a[a.length] = message[i + 3];
                    if (message[i + 4]) a[a.length] = message[i + 4];
                    if (message[i + 5]) a[a.length] = message[i + 5];
                    if (message[i + 6]) a[a.length] = message[i + 6];
                    if (message[i + 7]) a[a.length] = message[i + 7];
                    utils.execFile(utils.resolvePath('git.bat'), a);
                }

                return ctx.render('result', { result: '提交成功', url: '/gm/info', id: param.id });
            }
        }
    }
}