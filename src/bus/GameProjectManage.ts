import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../../src/table/GameTable";
import { IBusiness, register } from "../../src/BusinessInterface";
import ProjectIDTable from "../../src/table/ProjectIDTable";

@register('/gm/:type')
class GameProjectManage implements IBusiness {
    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        switch (ctx.params.type) {
            case 'show_add':
                return ctx.render('gm-add');
            case 'info': {
                let t = GameTable.ins;
                let a = await t.select(`id = ${param.id}`);
                t.close();
                return ctx.render('gm-info', { info: a[0] });
            }
            case 'add': {
                let t = GameTable.ins;
                param['id'] = await ProjectIDTable.ins.nextId();
                let n = await t.insert(param);
                t.close();
                return ctx.render('result', { result: `添加${n > 0 ? '成功' : '失败'}`, url: '/', id: '' });
            }
            case 'del': {
                let t = GameTable.ins;
                let n = await t.delete({ id: param.id });
                t.close();
                return ctx.render('result', { result: `删除${n > 0 ? '成功' : '失败'}`, url: '/', id: '' });
            }
            case 'update': {
                let t = GameTable.ins;
                let n = await t.update(param, { id: param.id });
                t.close();
                return ctx.render('result', { result: `修改${n > 0 ? '成功' : '失败'}`, url: '/gm/info', id: param.id });
            }
            default:
                return Promise.resolve();
        }
    }
}