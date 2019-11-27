import { QueryEngine } from "../../src/index"

import { describe,it } from "mocha"
import * as chai from 'chai'
import * as fs from 'fs'
import { SqlJsConnection, SqlJsDdlBuilder, initSqlJs} from "db-conn-sqljs"
import { Connection, DdlBuilder, MdTable, Metadata} from "db-conn"

describe(__filename, () => {
	var conn:SqlJsConnection;
	var engine:QueryEngine;
	var semantic:string;
	before(async function() {
		var SQL = await initSqlJs();
		conn = new SqlJsConnection();
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
		engine = new QueryEngine();
		semantic = "./test/metadata/semantic/Journal.semantic.json";		
	});
	it("join 1,2", async function() {
		var columns = ["Journal.id","Journal.balance","JournalLine.id", "JournalLine.lineNum", "JournalLine.credit","JournalLine.debit"];
		var result = await engine.query(conn, semantic, columns);
		chai.expect(result).to.eqls([
			{
				"id":1,
				"balance":100,
				"_array":
				[
					{"id":1,"lineNum":1,"credit":100,"debit":null},
					{"id":1,"lineNum":2,"credit":null,"debit":100}
				]
			},
			{
				"id":2,
				"balance":200,
				"_array":
				[
					{"id":2,"lineNum":1,"credit":200,"debit":null},
					{"id":2,"lineNum":2,"credit":null,"debit":200}
				]
			}
		]);
	});
	it("join 2,1", async function() {
		var columns = ["JournalLine.id", "JournalLine.lineNum", "Journal.id"];
		var result = await engine.query(conn, semantic, columns);
		//console.debug(JSON.stringify(result));
		chai.expect(result).to.eqls([{"id":1,"lineNum":1,"_array":[{"id":1}]},{"id":1,"lineNum":2,"_array":[{"id":1}]},{"id":2,"lineNum":1,"_array":[{"id":2}]},{"id":2,"lineNum":2,"_array":[{"id":2}]}]);
	});	
	it("sum 1", async function() {
		var columns = ["Journal.balance"];
		var result = await engine.query(conn, semantic, columns);
		chai.expect(result).to.eqls([ { balance: 300 } ]);		
	});
    it("sum 1,2", async () => {
		var columns = ["Journal.id", "JournalLine.credit","JournalLine.debit"];
		var result = await engine.query(conn, semantic, columns);
		chai.expect(result).to.eqls([
			{"id":1,"_array":[{"credit":100,"debit":100,"id":1}]},
			{"id":2,"_array":[{"credit":200,"debit":200,"id":2}]}
		]);
	});
    it("sum 2", async () => {
		var columns = ["JournalLine.credit","JournalLine.debit"];
		var result = await engine.query(conn, semantic, columns);
		chai.expect(result).to.eqls([ 
			{ credit: 300, debit: 300 } 
		]);
	});	
	/*it.only("join jump 1,Account", async function() {
		var columns = ["Journal.id", "Account.code"];
		var result = await engine.query(conn, semantic, columns);
		console.debug(JSON.stringify(result));
		chai.expect(result).to.eqls([]);
	});	*/	
});