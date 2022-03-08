import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../../src/table/GameTable";
import { IBusiness, register } from "../BusinessInterface";

@register('/')
class Main implements IBusiness {
    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        let t = GameTable.ins;
        let list = await t.select();
        return ctx.render('main', { items: list });
    }

}