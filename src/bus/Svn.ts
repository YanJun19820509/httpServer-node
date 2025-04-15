import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../table/GameTable";
import { IBusiness, register } from "../BusinessInterface";
import { utils } from "../utils";

@register('/svn/:type')
class Svn implements IBusiness {
    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        switch (ctx.params.type) {
            case 'update': {
                if (param.id == undefined) {
                    ctx.redirect('/');
                    return;
                }
                let t = GameTable.ins;
                let c = (await t.select(`id = ${param.id}`))[0];
                t.close();
                const m = utils.execFile(utils.resolvePath('update_proj.bat'), [c.root, c.branch]);
                return ctx.render('result', { result: `更新成功\n${m}`, url: '/gm/info', id: param.id});
            }
            default:
                return Promise.resolve();
        }
    }
}