import { SemanticView } from "./metadata/semantic/SemanticView";
import * as fs from "fs";
import { Table } from "./metadata/foundation/Table";
import { Column } from "./metadata/semantic/Column";
import { FoundationUtil } from "./metadata/FoundationUtil";


export class JoinEngine {

	public static async load(file:string):Promise<SemanticView> {
		let rawdata = fs.readFileSync(file).toString();
		var semanticObject:SemanticView = JSON.parse(rawdata);
		Object.setPrototypeOf(semanticObject, SemanticView.prototype);
		semanticObject.init();
		return semanticObject;
	}

	public executeQuery(semanticView:SemanticView,columns: string[] ):[string[], Table[]] {
		var sqls:string[] = [];
		var tables = this.expandSequence(semanticView, columns);
		for(var to = 0;to<tables.length;to++) {
			var sqlSelect = this.buildSqlSelect(semanticView, columns, tables, to);
			var sqlJoin = this.buildSqlFromWithJoin(semanticView, tables, to);
			var sql = sqlSelect + ' ' + sqlJoin;
			//console.dir(sql);
			sqls.push(sql);
		}
		
		return [sqls,tables];
		
	}
	private buildSqlSelect(semanticView: SemanticView, columns: string[], tables: Table[], to: number) {
		var sql = "select ";
		var tableAlias = tables[to].alias;
		for(let column of columns) {
			var alias = column.split(".")[0];
			if(tableAlias!=alias) {
				continue;
			}
			sql = sql + `${column},`;
		}
		sql = sql.substr(0, sql.length-1);
		return sql;
	}

	private expandSequence(semanticView:SemanticView,columns: string[]):Table[] {
		var set:any = {};
		var sequence:Table[] = [];
		for(let column of columns) {
			if(set[column]===undefined) {
				//var col:Column = semanticView.columns[column];
				var tableAlias = column.split(".")[0];
				var table = FoundationUtil.getByAlias(semanticView.foundationObject, tableAlias);
				set[column] = true;
				sequence.push(table);
			}			
		}
		return sequence;
	}


	public buildSqlFromWithJoin(semanticView:SemanticView,tables: Table[], to:number):string {
		var sql = null;
		for(var i=0;i<=to;i++) {
			sql = `left join ${tables[i].table} as ${tables[i].alias}`;
		}
		sql = sql.substr("left join".length);
		return "from" + sql;
	}
}