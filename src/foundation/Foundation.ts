import { Table } from "./Table";
import { Join } from "./Join";
//import { Tables } from "./Tables";

export class Foundation {
	public name:string;
	public description:string;
	public tables:Table[];
	public joins:Join[];
	public tablesMapByAlias:{[key:string]:Table};

}