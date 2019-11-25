import { SemanticView } from "./metadata/semantic/SemanticView";
import * as fs from "fs";


export class JoinEngine {

	public static async load(file:string):Promise<SemanticView> {
		let rawdata = fs.readFileSync(file).toString();
		var semanticObject:SemanticView = JSON.parse(rawdata);
		rawdata = fs.readFileSync(semanticObject.foundation).toString();
		semanticObject.foundationObject = JSON.parse(rawdata);
		return semanticObject;
	}

	public async executeQuery(semanticView:SemanticView,columns: string[] ):Promise<any[]> {
		return null;
		
	}

	public expandSequence(columns: string[]):string[] {
		return null;
	}
}