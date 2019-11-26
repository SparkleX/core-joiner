import { Foundation } from "./foundation/Foundation";
import { Table } from "./foundation/Table";
import { Join } from "./foundation/Join";

export class FoundationUtil {
	public static init(foundation:Foundation):void {
		foundation.tablesMapByAlias = {};
		for(let table of foundation.tables) {
			foundation.tablesMapByAlias[table.alias] = table;
		}
	}
	public static getByAlias(foundation:Foundation, alias:string):Table {
		return foundation.tablesMapByAlias[alias];
	}
	public static getJoin(foundation:Foundation, aliasLeft:string, aliasRight:string):Join {

		for(let join of foundation.joins) {
			if(join.left == aliasLeft && join.right == aliasRight) {
				return join;
			}
			if(join.left == aliasRight && join.right == aliasLeft) {
				var rt:Join = new Join();
				rt.left = join.right;
				rt.right = join.left;
				rt.on = join.on;
				return rt;
			}
		}
		return null;
	}

}