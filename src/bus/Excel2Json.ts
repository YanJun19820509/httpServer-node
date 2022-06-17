import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../../src/table/GameTable";
import { IBusiness, register } from "../../src/BusinessInterface";
import { e2j } from "../../src/func/e2j/ExcelExportJson";
import { utils } from "../../src/utils";

@register('/export_json')
class Excel2Json implements IBusiness {

    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        let t = GameTable.ins;
        let c = await t.select(`id = ${param.id}`);
        t.close();
        utils.execFile(utils.resolvePath('svn.bat'), [c[0].excelsDir]);
        let message = e2j.exportJson(c[0]);
        for (let i = 0, n = message.length; i < n; i += 8) {
            let a = [c[0].root + '/client/' + c[0].name.replace(/ /g, ''), message[i]];
            if (message[i + 1]) a[a.length] = message[i + 1];
            if (message[i + 2]) a[a.length] = message[i + 2];
            if (message[i + 3]) a[a.length] = message[i + 3];
            if (message[i + 4]) a[a.length] = message[i + 4];
            if (message[i + 5]) a[a.length] = message[i + 5];
            if (message[i + 6]) a[a.length] = message[i + 6];
            if (message[i + 7]) a[a.length] = message[i + 7];
            utils.execFile(utils.resolvePath('git.bat'), a);
        }
        return ctx.render('export-json-result', { result: message, id: param.id });
    }
}