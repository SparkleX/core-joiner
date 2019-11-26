import { SemanticView } from "./semantic/SemanticView";

import { Table } from "./foundation/Table";
import { Column } from "./semantic/Column";
import { FoundationUtil } from "./FoundationUtil";
import { SemanticUtil } from "./SemanticUtil";
import { ColumnType } from "./semantic/ColumnType";


export class JoinEngine {



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
			var col:Column = SemanticUtil.getColumnByAlias(semanticView, column);
			if(col.type==ColumnType.measure) {
				sql = sql + `sum(${column}),`;
			}else {
				sql = sql + `${column},`;
			}
		}
		sql = sql.substr(0, sql.length-1);
		return sql;
	}

	private expandSequence(semanticView:SemanticView,columns: string[]):Table[] {
		var set:any = {};
		var sequence:Table[] = [];
		for(let column of columns) {
			var tableAlias = column.split(".")[0];
			if(set[tableAlias]!==undefined) {
				continue;
			}
			set[tableAlias] = true;
			var table = FoundationUtil.getByAlias(semanticView.foundationObject, tableAlias);				
			sequence.push(table);
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