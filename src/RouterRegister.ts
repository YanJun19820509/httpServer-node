import { IBusiness } from "./BusinessInterface";


export default class RouterRegister {
    public businessList: any[];

    private static _ins: RouterRegister;

    public static get ins(): RouterRegister {
        if (!this._ins) this._ins = new RouterRegister();
        return this._ins;
    }

    constructor() {
        this.businessList = [];
    }

    public register(requestUrl: string, business: IBusiness, httpMethod?: string) {
        this.businessList[this.businessList.length] = { url: requestUrl, target: business, method: httpMethod };
    }
}