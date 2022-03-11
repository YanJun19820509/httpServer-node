import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import { SqliteDatabase } from "../../src/SqliteDatabase";
import { register } from "../../src/BusinessInterface";
import { IBusiness } from "../../src/BusinessInterface";
import { getDatabase } from "../../src/DatabaseInterface";

@register('/drop_table/:name')
class DropTable implements IBusiness {
    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        let a = getDatabase(SqliteDatabase);
        await a.dropTable(ctx.params.name);
        a.close();
        ctx.state = 200;
        return Promise.resolve();
    }
}