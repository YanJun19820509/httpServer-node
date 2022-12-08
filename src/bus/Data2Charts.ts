import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import { IBusiness } from "../../src/BusinessInterface";
import { register } from "../../src/BusinessInterface";

@register('/charts/:type')
class Data2Charts implements IBusiness {

    async handle(param: any, ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>): Promise<void> {
        switch (ctx.params.type) {
            case 'all':
                return ctx.render('echarts/all', { id: param.id, allData: this.getAll(), subData: {} });
            case 'sub':
                console.log(param);
                return ctx.render('echarts/all', { id: param.id, allData: this.getAll(), subData: this.getSub(param['subIndex']) });
            default:
                return Promise.resolve();
        }
    }

    private getAll() {
        let a = {
            title: {
                text: '综合数据'
            },
            tooltip: {},
            legend: {
                data: ['销量']
            },
            xAxis: {
                data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
            },
            yAxis: {},
            series: [
                {
                    name: '销量',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }
            ]
        };
        return JSON.stringify(a);
    }

    private getSub(idx: number) {
        let a = {
            title: {
                text: '接口数据'
            },
            tooltip: {},
            legend: {
                data: [`${idx}`]
            },
            xAxis: {
                data: ['100', '500', '1k', '2k', '5k', '10k']
            },
            yAxis: {},
            series: [
                {
                    name: `${idx}`,
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20],
                    itemStyle: { color: '#91c7ae' }
                },
                {
                    name: `${idx}`,
                    type: 'line',
                    data: [5, 20, 36, 10, 10, 20],
                    itemStyle: { color: '#2f4554' }
                }
            ]
        };
        return JSON.stringify(a);
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