import { getDatabase } from "../../src/DatabaseInterface";
import { SqliteDatabase, SqliteTable, tableInfo } from "../SqliteDatabase";

let _tableName = 'games';
@tableInfo(_tableName, [
    'id INT PRIMARY KEY     NOT NULL',
    'name TEXT NOT NULL',
    'root TEXT NOT NULL',
    'excelsDir TEXT',
    'jsonOutputConfig TEXT'
])
export default class GameTable extends SqliteTable {
    public static get ins(): GameTable {
        return getDatabase(SqliteDatabase).getTable(_tableName, GameTable);
    }
}