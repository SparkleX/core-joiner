import { Foundation } from "./foundation/Foundation";
import { Table } from "./foundation/Table";
import { FoundationUtil } from "./FoundationUtil";
import { Join } from "./foundation/Join";
export class JoinEngine {
	public joinAll(data: object[][], tables:Table[], foundation:Foundation):object[] {
		var left:object[] = data[0];
		for(var i =1;i<data.length;i++) {
			left = this.join(left, data[i], tables[i-1].alias, tables[i].alias, foundation);
		}
		return data[0];
		
	}
	private join(dataLeft:object[], dataRight:object[], tableAliasLeft:string, tableAliasRight:string, foundation:Foundation):object[] {
		var join:Join = FoundationUtil.getJoin(foundation, tableAliasLeft, tableAliasRight);
		var leftIndex = 0;
		var rightIndex = 0;
		for(;;) {
			if (this.isJoined(dataLeft[leftIndex], dataRight[rightIndex], join)) {				
				if((dataLeft[leftIndex] as any)["_array"] ===undefined ) {
					(dataLeft[leftIndex] as any)["_array"] = [];
				}
				(dataLeft[leftIndex] as any)["_array"].push(dataRight[rightIndex]);
				rightIndex++;
			}
			else {
				leftIndex++;
			}
			if(leftIndex>=dataLeft.length) {
				break;
			}
			if(rightIndex>=dataRight.length) {
				break;
			}
		}
		return dataLeft;
	}
	private isJoined(left: object, right: object, join: Join):boolean {
		var script =`var ${join.left} = left;`
		script +=`var ${join.right} = right;`;
		script+=  `${join.on.replace("=","==")}`;		
		var rt = eval(script);
		//var rt = eval('var a=1; var b=2; a==b;');
		return rt;
	}
}