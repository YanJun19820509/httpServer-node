import { utils } from "./utils";

export function databasePath(path: string) {
    return function (target: Function) {
        target.prototype['__databasePath'] = utils.resolvePath(path);
    };
}

export interface IDatabase {
    db: any;
    open(dbPath: string): void;
    close(): void;
    createTable(name: string, info: string): Promise<any>;
    getTable<T extends ITable>(name: string, type: (new () => T)): T;
    dropTable(name: string): Promise<any>;
}

export interface ITable {
    db: any;
    name: string;
    insert(data: any | any[]): Promise<number>;
    delete(condition: any): Promise<number>;
    update(data: any, condition: any): Promise<number>;
    // select(condition: {  }, ...or: {  }[]): Promise<any[]>;
    select(condition?: string): Promise<any[]>;
    close(): void;
}

export function getDatabase<T extends IDatabase>(clazz: any): T {
    let path = clazz.prototype['__databasePath'];
    let a: T = new clazz();
    a.open(path);
    return a;
}