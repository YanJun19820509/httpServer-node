import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../../src/table/GameTable";
import { IBusiness, register } from "../../src/BusinessInterface";
import { e2j } from "../../src/func/e2j/ExcelExportJson";

@register('/export_json')
class Excel2Json implements IBusiness {

    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        let t = GameTable.ins;
        let c = await t.select(`id = ${param.id}`);
        let message = e2j.exportJson(c[0]);
        return ctx.render('export-json-result', { result: message, id: param.id });
    }
}