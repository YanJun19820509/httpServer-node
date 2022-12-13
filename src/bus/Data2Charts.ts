import { readdirSync, statSync } from "fs";
import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import { extname } from "path";
import { IBusiness } from "../../src/BusinessInterface";
import { register } from "../../src/BusinessInterface";
import { utils } from "../../src/utils";

@register('/charts/:type')
class Data2Charts implements IBusiness {
    private datas: any;
    private _keys: string[] = [];

    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        switch (ctx.params.type) {
            case 'all':
                return ctx.render('echarts/all', { id: param.id, allData: this.getAll(), subData: JSON.stringify({ charts1: {}, charts2: {} }) });
            case 'sub':
                console.log(param);
                return ctx.render('echarts/all', { id: param.id, allData: this.getAll(), subData: this.getSub(param['subIndex']) });
            default:
                return Promise.resolve();
        }
    }

    private getAll() {
        if (!this.datas) this.initData();
        let keys: string[] = [], series: { [k: string]: { name: string, type: 'bar' | 'line', data: number[], stack?: string, yAxisIndex?: number } } = {};
        for (const key in this.datas) {
            keys[keys.length] = this.getName(key);
            this._keys[this._keys.length] = key;
            const a: any[] = this.datas[key];
            let to: number = 0;
            a.forEach(aa => {
                let b = series[aa.name] || { name: `${aa.name}并发`, type: 'bar', data: [] };
                b.data[b.data.length] = aa.totalReqSize / aa.totalReqNum;
                series[aa.name] = b;
                to += aa.avg;
            });
            let c = series['_avg_'] || { name: `平均延时数`, type: 'bar', data: [], yAxisIndex: 1 };
            c.data[c.data.length] = to / a.length;
            series['_avg_'] = c;
        }
        return JSON.stringify(this.createChartsData('综合数据', Object.values(series), { data: keys, name: '接口', axisLabel: { interval: 0, rotate: 30 } }, [{ name: '平均带宽（bytes）' }, { name: '平均延时数' }]));
    }

    private getSub(idx: number) {
        const key = this._keys[idx];
        const name = this.getName(key);
        const a: any[] = this.datas[key];
        let keys1: string[] = [],
            keys2: string[] = ['50%', '60%', '70%', '80%', '90%', '95%', '99%', '99.9%', '99.99%'],
            series1: { [k: string]: { name: string, type: 'bar' | 'line', data: number[], stack?: string } } = {},
            series2: { [k: string]: { name: string, type: 'bar' | 'line', data: number[], stack?: string } } = {};
        a.forEach(aa => {
            keys1[keys1.length] = `${aa.name}并发`;
            // series1[aa.name] = { name: `${aa.name}并发`, type: 'bar', data: [aa.totalReqSize, aa.totalRespSize] };
            series1['totalReqSize'] = series1['totalReqSize'] || { name: `总请求带宽`, type: 'bar', data: [] };
            series1['totalReqSize'].data[series1['totalReqSize'].data.length] = aa.totalReqSize;
            series1['totalRespSize'] = series1['totalRespSize'] || { name: `总返回带宽`, type: 'bar', data: [] };
            series1['totalRespSize'].data[series1['totalRespSize'].data.length] = aa.totalRespSize;
            series1['totalReqNum'] = series1['totalReqNum'] || { name: `总请求数`, type: 'bar', data: [], yAxisIndex: 1 };
            series1['totalReqNum'].data[series1['totalReqNum'].data.length] = aa.totalReqNum;
            series2[aa.name] = { name: `${aa.name}并发`, type: 'bar', data: [aa.p50, aa.p60, aa.p70, aa.p80, aa.p90, aa.p95, aa.p99, aa.p999, aa.p9999] };
        });

        return JSON.stringify({
            charts1: this.createChartsData(`接口_${name}`, Object.values(series1), { data: keys1 }, [{ name: '带宽（bytes）' }, { name: '请求次数' }]),
            charts2: this.createChartsData(`接口_${name}`, Object.values(series2), { data: keys2, name: '延迟分位数' }, { name: '延迟个数' })
        });
    }

    private createChartsData(title: string, series: { name: string, type: 'bar' | 'line', data: number[], itemStyle?: { color: string } }[], xAxis: { data: string[], name?: string, type?: string, axisLabel?: any }, yAxis?: { data?: string[], name?: string, type?: string } | { data?: string[], name?: string, type?: string, min?: number, max?: number }[]): any {
        let legendTitles: string[] = [];
        series.forEach(s => {
            legendTitles[legendTitles.length] = s.name;
        });
        let a = {
            title: {
                text: title
            },
            tooltip: {},
            legend: {
                data: legendTitles
            },
            xAxis: xAxis,
            yAxis: yAxis || {},
            series: series
        };
        return a;
    }

    private initData() {
        this.datas = {};
        const dir = utils.resolvePath('data/serverPressureTest');
        const files = readdirSync(dir);
        for (let i = 0, n = files.length; i < n; i++) {
            const file = files[i];
            const st = statSync(`${dir}/${file}`);
            if (!st.isFile() || extname(file) != '.json') continue;
            this.parseJsonFile(`data/serverPressureTest/${file}`);
        }
    }

    private parseJsonFile(path: string) {
        const json = utils.readJson(path);
        let a = this.datas[json.apiRoute] || [];
        a[a.length] = {
            "name": json.connectionCnt,
            "avg": json.avg,
            "max": json.max,
            "min": json.min,
            "p50": json.p50,
            "p60": json.p60,
            "p70": json.p70,
            "p80": json.p80,
            "p90": json.p90,
            "p95": json.p95,
            "p99": json.p99,
            "p999": json.p999,
            "p9999": json.p9999,
            "totalReqNum": json.totalReqNum,
            "totalReqSize": json.totalReqSize,
            "totalReqTime": json.totalReqTime,
            "totalRespSize": json.totalRespSize
        };
        this.datas[json.apiRoute] = a;
    }

    private getName(key: string): string {
        return {
            "0-0": "性能参考接口",
            "0-2": "获取用户客户端信息",
            "0-3": "设置用户客户端信息",
            "3-1": "居民升级",
            "4-1": "完成任务",
            "3-2": "居民升星",
            "5-1": "免费契约",
            "5-2": "黄金契约",
            "5-3": "闪耀契约 ",
            "8-1": "消耗体力",
            "9-1": "使用道具",
            "8-3": "获取粉尘",
            "9-3": "快速获取",
            "8-4": "获取体力"
        }[key] || key;
    }
    // color: [
    //     '#c23531',
    //     '#2f4554',
    //     '#61a0a8',
    //     '#d48265',
    //     '#91c7ae',
    //     '#749f83',
    //     '#ca8622',
    //     '#bda29a',
    //     '#6e7074',
    //     '#546570',
    //     '#c4ccd3'
    // ],
}