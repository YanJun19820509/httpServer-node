import { databasePath, getDatabase, IDatabase, ITable } from "./DatabaseInterface";
import { Database, RunResult } from "sqlite3";

@databasePath('sqlite.db')
export class SqliteDatabase implements IDatabase {
    db: Database | undefined;

    open(dbPath: string): void {
        this.db = new Database(dbPath, (err) => {
            if (err) {
                console.log('Could not connect to database', err)
            } else {
                console.log('Connected to database')
            }
        });
    }

    close(): void {
        this.db?.close();
        console.log('close database')
    }

    createTable(name: string, info: string): Promise<RunResult | null> {
        let sql = `CREATE TABLE IF NOT EXISTS ${name} (${info});`;
        return this.runSql(sql);
    }

    getTable<T extends SqliteTable>(name: string, type: (new () => T)): T {
        let a = new type();
        a.name = name;
        a.db = this;
        return a;
    }

    dropTable(name: string): Promise<RunResult | null> {
        let sql = `DROP TABLE ${name}`;
        return this.runSql(sql);
    }

    private runSql(sql: string): Promise<RunResult | null> {
        return new Promise<RunResult | null>(resolve => {
            this.db?.run(sql, (result: RunResult, err: Error) => {
                if (err) {
                    console.error(sql, err);
                    resolve(null);
                }
                else resolve(result);
            });
        });
    }
}



function getFormatValue(v: any): any {
    if (typeof v == 'number') return v;
    if (typeof v == 'string') return `'${v}'`;
}

export function tableInfo(name: string, cols: string[]) {
    return function (target: Function) {
        if (name == '' || cols.length == 0) return;
        let db = getDatabase(SqliteDatabase);
        db.createTable(name, cols.join(',')).then(() => {
            db.close();
        });
    };
}

@tableInfo('', [])
export class SqliteTable implements ITable {
    db: SqliteDatabase | undefined;
    name: string = '';

    async insert(datas: any | any[]): Promise<number> {
        return new Promise<number>(resolve => {
            datas = [].concat(datas);
            let cols = Object.keys(datas[0]), bb = [];
            for (let i = cols.length; i > 0; i--) bb[bb.length] = '?';
            let stmt = this.db!.db!.prepare(`INSERT INTO ${this.name} (${cols.join(',')}) VALUES (${bb.join(',')}) ;`);
            for (let i = 0, l = datas.length; i < l; i++) {
                let data = datas[i];
                let vals = [];
                for (let j = 0, m = cols.length; j < m; j++) {
                    vals[vals.length] = data[cols[j]] || 'NULL';
                }
                stmt.bind(vals);
                stmt.reset();
            }
            stmt.run(err => {
                stmt.finalize();
                if (err) {
                    console.error('insert  error', err);
                    resolve(0);
                } else resolve((stmt as RunResult).changes);
            });
        });
    }
    async delete(condition: any): Promise<number> {
        return new Promise<number>(resolve => {
            let c = '';
            if (typeof condition == 'string') {
                c = condition;
            } else
                for (const col in condition) {
                    if (c != '') c += ' AND ';
                    c += `${col} = ${getFormatValue(condition[col])}`;
                }
            let stmt = this.db!.db!.prepare(`DELETE FROM ${this.name} WHERE ${c} ;`);
            stmt.run((err: Error) => {
                stmt.finalize();
                if (err) {
                    console.error('delete error', err);
                    resolve(0);
                } else resolve((stmt as RunResult).changes);
            });
        });
    }
    async update(data: any, condition: any): Promise<number> {
        return new Promise<number>(resolve => {
            let s = '';
            for (const col in data) {
                if (s != '') s += ' , ';
                s += `${col} = ${getFormatValue(data[col])}`;
            }
            let c = '';
            for (const col in condition) {
                if (c != '') c += ' AND ';
                c += `${col} = ${getFormatValue(condition[col])}`;
            }
            let stmt = this.db!.db!.prepare(`UPDATE ${this.name} SET ${s} WHERE ${c} ;`);
            stmt.run(err => {
                stmt.finalize();
                if (err) {
                    console.error('update error', err);
                    resolve(0);
                } else resolve((stmt as RunResult).changes);
            });
        });
    }

    async select(condition?: string): Promise<any[]> {
        return new Promise<any[]>(resolve => {
            let sql = `SELECT * FROM ${this.name} ${condition ? 'WHERE ' + condition : ''};`;
            let stmt = this.db!.db!.prepare(sql);
            stmt.all((err: Error, rows: any[]) => {
                stmt.finalize();
                if (err) {
                    console.error('select error', err);
                    resolve([]);
                } else {
                    console.error('select', rows);
                    resolve(rows);
                }
            });
        });
    }

    // async select(condition: {  }, ...or: {  }[]): Promise<any[]> {
    //     return new Promise<any[]>(resolve => {
    //         let stmt = this.db.prepare(`SELECT * FROM ${this.name} WHERE ?;`);
    //         for (const col in data) {
    //             stmt.run(col, data[col]);
    //         }
    //         stmt.finalize(err => {
    //             if (err) {
    //                 console.error(err);
    //                 resolve(0);
    //             } else resolve(1);
    //         });
    //     });
    // }

    close(): void {
        this.db?.close();
    }
}