import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import { IBusiness, register } from "../BusinessInterface";
import CDNTable from "../table/CDNTable";
import AWS from 'aws-sdk';
import { createReadStream } from "fs";
import { join } from "path";

@register('/cdn/:type')
class CDN implements IBusiness {
    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        switch (ctx.params.type) {
            case 'info': {
                const t = CDNTable.ins;
                const a = await t.select(`id = ${param.id}`);
                t.close();
                const info = a[0] || { id: param.id };
                return ctx.render('cdn', { info: info });
            }
            case 'save': {
                const t = CDNTable.ins;
                const a = await t.select(`id = ${param.id}`);
                let n: number;
                if (!a[0])
                    n = await t.insert(param);
                else n = await t.update(param, { id: param.id });
                t.close();
                return ctx.render('result', { result: `保存${n > 0 ? '成功' : '失败'}`, url: '/cdn/info', id: param.id });
            }
            case 'upload_release': {
                const t = CDNTable.ins;
                const a = await t.select(`id = ${param.id}`);
                t.close();
                const info = a[0];
                if (!info) return;
                let r = await this.upload({ accessKeyId: info.r_accessKeyId, accessKeySecret: info.r_accessKeySecret, bucket: info.bucket, root: info.release_dir }, param.dir, ctx.request.files, param.max_age);
                return ctx.render('result', { result: `上传${r ? '成功' : '失败, 请查看日志'}`, url: '/cdn/info', id: param.id });
            }
            case 'upload_test': {
                const t = CDNTable.ins;
                const a = await t.select(`id = ${param.id}`);
                t.close();
                const info = a[0];
                if (!info) return;
                let r = await this.upload({ accessKeyId: info.t_accessKeyId, accessKeySecret: info.t_accessKeySecret, bucket: info.bucket, root: info.test_dir }, param.dir, ctx.request.files, param.max_age);
                return ctx.render('result', { result: `上传${r ? '成功' : '失败, 请查看日志'}`, url: '/cdn/info', id: param.id });
            }
            default:
                return Promise.resolve();
        }
    }

    private async upload(info: any, path: string, fileInfo: any, max_age: string): Promise<boolean> {
        return new Promise<boolean>(resole => {
            const file = fileInfo.file;
            if (file.size == 0) {
                console.log('上传文件无效！');
                resole(false);
                return;
            }
            AWS.config.update({
                accessKeyId: info.accessKeyId,
                secretAccessKey: info.accessKeySecret
            });
            let params: any = {
                Bucket: info.bucket,
                Body: createReadStream(file.filepath),
                Key: join(info.root, path, file.originalFilename).replace(/\\/g, '/')
            };
            if (max_age) params.CacheControl = `max-age=${max_age}`;
            const s3 = new AWS.S3();
            s3.putObject(params, (err: Error, data: any) => {
                if (err == null) {
                    resole(true);
                } else {
                    console.log(err);
                    resole(false);
                }
            });
        });
    }
}