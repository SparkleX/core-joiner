import { Connection } from 'db-conn';
import { SqlEngine, JoinEngine } from '.';
import { SemanticView } from './semantic/SemanticView';
import { SemanticUtil } from './SemanticUtil';

export class QueryEngine {
	private joinEngine = new JoinEngine();
	private sqlEngine = new SqlEngine();

	private async execute(conn:Connection, sqls:string[]):Promise<object[][]> {
		var rt:object[][] = [];
		for(let sql of sqls) {
			var list = await conn.executeQuery(sql);
			console.dir(list);
			rt.push(list);
		}
		return rt;
	}

	public async query(conn:Connection, semanticFile:string, columns:string[]):Promise<object[]> {
		var semanticView:SemanticView = await SemanticUtil.load(semanticFile);
		var [sqls, tables] = this.sqlEngine.executeQuery(semanticView, columns);
		var listOfData:object[][] = await this.execute(conn, sqls);
		var result:object[] = this.joinEngine.joinAll(listOfData, tables,semanticView.foundationObject);
		
		return result;
	}
}