
import { Foundation } from "../foundation/Foundation";
import { Columns } from "./Columns";
import { Column } from "./Column";
import * as fs from "fs";
import { FoundationUtil } from './../FoundationUtil';

export class SemanticView {
	public foundation: string;
	public foundationObject:Foundation;
	public columns:Columns;//{ [key: string]: Column };
	public  async init():Promise<void> {
		var rawdata = fs.readFileSync(this.foundation).toString();
		this.foundationObject = JSON.parse(rawdata);
		FoundationUtil.init(this.foundationObject);
	}


}