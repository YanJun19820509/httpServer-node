import { getDatabase } from "../DatabaseInterface";
import { SqliteDatabase, SqliteTable, tableInfo } from "../SqliteDatabase";

let _tableName = 'cdn';
@tableInfo(_tableName, [
    'id INT PRIMARY KEY     NOT NULL',
    'r_accessKeyId TEXT NOT NULL',
    'r_accessKeySecret TEXT NOT NULL',
    't_accessKeyId TEXT NOT NULL',
    't_accessKeySecret TEXT NOT NULL',
    'bucket TEXT NOT NULL',
    'release_dir TEXT NOT NULL',
    'test_dir TEXT NOT NULL'
])
export default class CDNTable extends SqliteTable {
    public static get ins(): CDNTable {
        return getDatabase(SqliteDatabase).getTable(_tableName, CDNTable);
    }
}