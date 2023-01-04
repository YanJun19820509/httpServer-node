import Koa from 'koa';
import MyRouter from './MyRouter';
import body from 'koa-body';
import BusinessLoader from './BusinessLoader';
import { NotFound } from './NotFound';
import views from 'koa-views';
import serve from 'koa-static';
import { utils } from './utils';

/**
 * api
 * https://github.com/demopark/koa-docs-Zh-CN
 * https://github.com/koajs/router/blob/master/API.md
 * 
 */
let start = function () {
    try {
        //业务逻辑要在MyRouter初始化之前加载
        BusinessLoader.load();

        const app = new Koa();
        const router = new MyRouter();

        //设置notfound
        app.use(NotFound.handle);

        //解析post传参
        //body要在router之前加载
        app.use(body({
            multipart: true
        }));
        
        //设置视图模板引擎，要在router之前加载
        app.use(views(utils.resolvePath('view/ejs'), {
            extension: 'ejs'
        }));

        app.use(serve('js'));

        app.use(router.routes());
        app.use(router.allowedMethods());

        app.listen(3000);

        console.log('Server is runing !!')
    } catch (e) {
        console.error('Server stoped !!')
        console.log(e);
    }
};

start(); 
