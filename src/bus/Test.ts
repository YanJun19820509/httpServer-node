import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import GameTable from "../../src/table/GameTable";
import { register } from "../../src/BusinessInterface";
import { IBusiness } from "../../src/BusinessInterface";

@register('/test')
class Test implements IBusiness {
    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        let t = GameTable.ins;
        // let n = await t.insert({
        //     id: 2,
        //     name: 'Titan-B',
        //     root: "G:/work/Titan-Project-A",
        //     excelsDir: JSON.stringify([
        //         "/配置"
        //     ]),
        //     jsonOutputConfig: "/配置/dest.json"
        // });
        // console.log(n);
        // // await t.update({id:1,name:'Titan-A'},{id:2});
        // await t.delete({id:1});
        ctx.body = await t.select();
        t.close();
        return Promise.resolve();
    }
}