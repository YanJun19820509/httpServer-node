import { getDatabase } from "../../src/DatabaseInterface";
import { SqliteDatabase, SqliteTable, tableInfo } from "../SqliteDatabase";

let _tableName = 'proid';
@tableInfo(_tableName, [
    'id INT NOT NULL'
])
export default class ProjectIDTable extends SqliteTable {
    public static get ins(): ProjectIDTable {
        return getDatabase(SqliteDatabase).getTable(_tableName, ProjectIDTable);
    }

    public async nextId(): Promise<number> {
        let a = await this.select();
        if (a.length == 0) {
            a[0] = { id: 0 };
            await this.insert(a);
        }
        let oid = a[0].id;
        let id = oid + 1;
        await this.update({ 'id': id }, { 'id': oid });
        return id;
    }
}