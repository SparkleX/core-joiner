import { QueryEngine } from "../../src/index"

import { describe,it } from "mocha"
import * as chai from 'chai'
import * as fs from 'fs'
import { SqlJsConnection, SqlJsDdlBuilder, initSqlJs} from "db-conn-sqljs"
import { Connection, DdlBuilder, MdTable, Metadata} from "db-conn"

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
		//var list = await conn.executeQuery(`select sum(JournalLine.credit) as "JournalLine.credit",sum(JournalLine.debit) as "JournalLine.debit",JournalLine.id as "JournalLine.id" from JournalLine as JournalLine group by JournalLine.id`);
		//console.dir(list);
		var engine = new QueryEngine();
		var semantic = "./test/metadata/semantic/Journal.semantic.json";
		var columns;
		var result;
		/*columns = ["Journal.id","JournalLine.id","Journal.balance","JournalLine.credit","JournalLine.debit"];
		result = await engine.query(conn, semantic, columns);
		console.dir(JSON.stringify(result));

		columns = ["Journal.balance"]
		result = await engine.query(conn, semantic, columns);
		console.dir(result);*/

		columns = ["Journal.id", "JournalLine.credit","JournalLine.debit"];
		result = await engine.query(conn, semantic, columns);
		console.dir(JSON.stringify(result));
		console.dir(result);
    });
});