import Application from "koa";

export namespace NotFound {
    export async function handle(ctx: Application.ParameterizedContext, next: Function) {
        try {
            await next();
        } catch (e) {
            console.error(e);
        }

        if (ctx.status === 404) {
            console.error('not found', ctx.request.toJSON());
        }
    }
}