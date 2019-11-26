import { SemanticView } from "./semantic/SemanticView";
import * as fs from "fs";
import { FoundationUtil } from "./FoundationUtil";
import { Column } from "./semantic/Column";

export class SemanticUtil {
	public static async load(file:string):Promise<SemanticView> {
		let rawdata = fs.readFileSync(file).toString();
		var semanticObject:SemanticView = JSON.parse(rawdata);
		Object.setPrototypeOf(semanticObject, SemanticView.prototype);
		SemanticUtil.init(semanticObject);
		return semanticObject;
	}
	private static  init(semantic:SemanticView):void{
		var rawdata = fs.readFileSync(semantic.foundation).toString();
		semantic.foundationObject = JSON.parse(rawdata);
		FoundationUtil.init(semantic.foundationObject);
	}
	public static getColumnByAlias(semantic:SemanticView, alias:string):Column {
		var rt = semantic.columns[alias];
		if(rt == undefined) {
			throw new Error(`[${alias}] is not defined in semantic layer`);
		}
		return rt;
	}
}