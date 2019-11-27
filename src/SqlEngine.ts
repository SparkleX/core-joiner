import { SemanticView } from "./semantic/SemanticView";

import { Table } from "./foundation/Table";
import { Column } from "./semantic/Column";
import { FoundationUtil } from "./FoundationUtil";
import { SemanticUtil } from "./SemanticUtil";
import { ColumnType } from "./semantic/ColumnType";


export class SqlEngine {



	public executeQuery(semanticView:SemanticView,columns: string[] ):[string[], Table[]] {
		var sqls:string[] = [];
		var tables = this.expandSequence(semanticView, columns);
		for(var to = 0;to<tables.length;to++) {
			var sqlSelect = this.buildSqlSelect(semanticView, columns, tables, to);
			var sqlJoin = this.buildSqlFromWithJoin(semanticView, tables, to);

			var allCols = this.getSelectColumns(semanticView, columns, tables, to);
			var dimCols = this.getDimColumns(semanticView, allCols);

			var sqlGroupBy = this.sqlGroupBy(dimCols);
			var sql = sqlSelect + ' ' + sqlJoin + ' ' + sqlGroupBy;
			//console.dir(sql);
			sqls.push(sql);
		}
		
		return [sqls,tables];
		
	}
	sqlGroupBy(dimCols: string[]) {
		if(dimCols.length == 0) {
			return "";
		}
		var sql:string="";
		for(let col of dimCols) {
			sql+= (col+",");
		}
		sql = sql.substr(0, sql.length-1);
		return "group by " + sql;

	}
	private getDimColumns(semanticView: SemanticView, columns: string[]):string[] {
		var cols:string[] = [];
		for(let col of columns) {
			var mdColumn = SemanticUtil.getColumnByAlias(semanticView, col);
			if(mdColumn.type !== ColumnType.measure) {
				cols.push(col);
			}
		}
		return cols;		
	}	
	private getSelectColumns(semanticView: SemanticView, columns: string[], tables: Table[], to: number):string[] {
		var cols:string[] = [];
		var tableAlias = tables[to].alias;
		var usedColumn:any = {};
		for(let column of columns) {
			var alias = column.split(".")[0];
			if(tableAlias!=alias) {
				continue;
			}
			usedColumn[column] = true;
		}		
		if(tables.length-1>to) {
			var joinCols:string[] = this.getJoinedColumn(semanticView, tables[to], tables[to+1]);
			for(let column of joinCols) {
				if(usedColumn[column]===undefined) {
					usedColumn[column] = true;
				}
			}			
		}
		if(to>0) {
			var joinCols:string[] = this.getJoinedColumn(semanticView,  tables[to], tables[to-1]);
			for(let column of joinCols) {
				if(usedColumn[column]===undefined) {
					usedColumn[column] = true;
				}
			}			
		}		
		for(var key in usedColumn) {
			cols.push(key);
		}
		return cols;		
	}
	private buildSqlSelect(semanticView: SemanticView, columns: string[], tables: Table[], to: number) {
		var sql = "select ";
		var tableAlias = tables[to].alias;
		var usedColumn:any = {};
		for(let column of columns) {
			var alias = column.split(".")[0];
			var fieldName = column.split(".")[1];
			if(tableAlias!=alias) {
				continue;
			}
			usedColumn[column] = true;
			var col:Column = SemanticUtil.getColumnByAlias(semanticView, column);
			if(col.type==ColumnType.measure) {
				sql = sql + `sum(${column}) as "${fieldName}",`;
			}else {
				sql = sql + `${column} as "${fieldName}",`;
			}
		}		
		if(tables.length-1>to) {
			var joinCols:string[] = this.getJoinedColumn(semanticView, tables[to], tables[to+1]);
			for(let column of joinCols) {
				if(usedColumn[column]===undefined) {
					var fieldName = column.split(".")[1];
					sql = sql + `${column} as "${fieldName}",`;
				}
			}			
		}
		if(to>0) {
			var joinCols:string[] = this.getJoinedColumn(semanticView,  tables[to], tables[to-1]);
			for(let column of joinCols) {
				if(usedColumn[column]===undefined) {
					var fieldName = column.split(".")[1];
					sql = sql + `${column} as "${fieldName}",`;
				}
			}			
		}		
		sql = sql.substr(0, sql.length-1);
		return sql;
	}
	private getJoinedColumn(semanticView: SemanticView,leftTable:Table, rightTable:Table):string[] {
		for(let join of semanticView.foundationObject.joins) {
			if ((join.left == leftTable.alias) && (join.right==rightTable.alias)) {
				var rt = this.getColumnOfTable(join.on, join.left);
				return rt;
			}
			if ((join.left == rightTable.alias) && (join.right==leftTable.alias)) {
				var rt = this.getColumnOfTable(join.on, join.right);
				return rt;
			}
		}
		return [];
	}
	private getColumnOfTable(on: string, tableAlias: string):string[] {
		var regx = new RegExp(`${tableAlias}\\.([a-zA-Z0-9_]+)`,"g");
		var result = [...(on as any).matchAll(regx)];
		var rt:string[]=[];
		result.forEach(a=>{rt.push(a[0])});
		return rt;
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