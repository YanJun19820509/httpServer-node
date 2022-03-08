import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import RouterRegister from "./RouterRegister";

export function register(url: string, method?: string) {
    return function (target: Function) {
        // target.prototype['__requestUrl'] = url;
        // target.prototype['__httpMethod'] = method;
        let a = new target.prototype.constructor();
        RouterRegister.ins.register(url, a, method);
    };
}

export interface IBusiness {

    handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void>;
}