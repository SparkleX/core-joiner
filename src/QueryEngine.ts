import { Connection } from 'db-conn';

export class QueryEngine {
	public async execute(conn:Connection, sqls:string[]):Promise<object[][]> {
		var rt:object[][] = [];
		for(let sql of sqls) {
			var list = await conn.executeQuery(sql);
			rt.push(list);
		}
		return rt;
	}
}