import Router from "koa-router";
import { IBusiness } from "./BusinessInterface";
import RouterRegister from "./RouterRegister";

export enum HttpMethod {
    Get = 'GET',
    Put = 'PUT',
    Post = 'POST',
    Patch = 'PATCH',
    Delete = 'DELETE'
}

export default class MyRouter extends Router {

    constructor(prefix?: string) {
        super({
            prefix: prefix,
            sensitive: true,
            strict: true
        });

        this.init();
    }

    private init() {
        let list: { url: string, target: IBusiness, method?: string }[] = RouterRegister.ins.businessList;
        list.forEach(a => {
            this.bindRequest(a.url, a.target, a.method);
        });
    }

    private bindRequest(url: string, target: IBusiness, method?: string) {
        this.all(url, async (ctx, next) => {
            let m = ctx.method, param: any;
            if (m == HttpMethod.Get) {
                if (Object.keys(ctx.params).length > 0)
                    param = ctx.params;
                else param = this.parseQuery(ctx.querystring);
            } else {
                param = ctx.request.body;
            }
            if (method && m != method) {
                console.error(`[${m}]没有符合的业务：`, url)
                return;
            }

            await target.handle(param, ctx);
            await next();
        });
    }

    private parseQuery(querystring: string): any {
        let a = querystring.split('&');
        let b: any = {};
        a.forEach(c => {
            let d = c.split('=');
            b[d[0]] = d[1];
        });
        return b;
    }
}