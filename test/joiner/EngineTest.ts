import { JoinEngine } from "../../src/index"

import { describe,it } from "mocha"
import * as chai from 'chai'
import * as fs from 'fs'
import { SqlJsConnection, SqlJsDdlBuilder, initSqlJs} from "db-conn-sqljs"
import { Connection, DdlBuilder, MdTable, Metadata} from "db-conn"
import { SemanticView } from './../../src/metadata/semantic/SemanticView';

describe(__filename, () => {
	
    it("test", async () => {

		var SQL = await initSqlJs();
		var conn:Connection = new SqlJsConnection();
		conn.open(SQL);
		var mdTables:MdTable[] = (await Metadata.loadAll("test/metadata/table/")).tables;
		var ddlBuilder:DdlBuilder = new SqlJsDdlBuilder();
		for(let mdTable of mdTables) {
			var sqls = ddlBuilder.createTable(mdTable);
			await conn.execute(sqls[0]);
		}
		for(let mdTable of mdTables) {
			var sql = ddlBuilder.insertSql(mdTable);
			let rawdata = fs.readFileSync(`test/metadata/data/${mdTable.name}.data.json`).toString();
			var data = JSON.parse(rawdata);
			var paramsArray = ddlBuilder.insertData(mdTable, data);
			for(let param of paramsArray) {
				await conn.execute(sql, param);
			}
		}		

		var semanticView:SemanticView = await JoinEngine.load("./test/metadata/semantic/Journal.semantic.json");
		var joinEngine:JoinEngine = new JoinEngine();
		var list = await joinEngine.executeQuery(semanticView, ["id","lineNum"]);
		console.dir(list);

    });
});