import { JoinEngine, QueryEngine, DataJoinEngine } from "../../src/index"

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
		//var list = await conn.executeQuery(`select t0.id from Journal t0 inner join JournalLine t1 on t0.id = t1.id`);
		//console.dir(list);
		var semanticView:SemanticView = await JoinEngine.load("./test/metadata/semantic/Journal.semantic.json");
		var joinEngine:JoinEngine = new JoinEngine();
		var [sqls, tables] = joinEngine.executeQuery(semanticView, ["Journal.id","JournalLine.id"]);
		var queryEngine:QueryEngine = new QueryEngine();
		var listOfData:object[][] = await queryEngine.execute(conn, sqls);

		var dataJoinEngine = new DataJoinEngine();
		var result = dataJoinEngine.joinAll(listOfData, tables,semanticView.foundationObject);
		console.dir(JSON.stringify(result));
    });
});