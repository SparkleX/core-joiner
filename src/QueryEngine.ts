import { Connection } from 'db-conn';
import { JoinEngine, DataJoinEngine } from '.';
import { SemanticView } from './semantic/SemanticView';
import { SemanticUtil } from './SemanticUtil';

export class QueryEngine {
	private dataJoinEngine = new DataJoinEngine();
	private joinEngine = new JoinEngine();

	private async execute(conn:Connection, sqls:string[]):Promise<object[][]> {
		var rt:object[][] = [];
		for(let sql of sqls) {
			var list = await conn.executeQuery(sql);
			rt.push(list);
		}
		return rt;
	}

	public async query(conn:Connection, semanticFile:string, columns:string[]):Promise<object[]> {
		var semanticView:SemanticView = await SemanticUtil.load(semanticFile);
		var [sqls, tables] = this.joinEngine.executeQuery(semanticView, columns);
		var listOfData:object[][] = await this.execute(conn, sqls);
		var result:object[] = this.dataJoinEngine.joinAll(listOfData, tables,semanticView.foundationObject);
		console.dir(JSON.stringify(result));
		return result;
	}
}