/* Copyright 2017 MaulingMonkey

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

module mmk { export module autotables {
	export type AutoTableRow = {[id: string]: string};
	export type AutoTable = AutoTableRow[];

	interface HeaderCell {
		rawValue:	boolean;
		source:		string;
		class:		string;
		colSpan:	number;
		rowSpan:	number;
	}
	interface HeaderRow {
		cells:		HeaderCell[];
		class:		string;
	}

	interface Cell {
		header:		HeaderCell;
		value:		string;
	}
	interface Row {
		header:		HeaderRow;
		cells:		Cell[];
	}
	function bindAutoTable(data: AutoTable, headerRows: HeaderRow[]): Row[] {
		let rows : Row[] = [];
		data.forEach(dataRow => {
			headerRows.forEach(headerRow => {
				let row : Row = { header: headerRow, cells: [] };
				headerRow.cells.forEach(headerCell => {
					let v = headerCell.rawValue ? headerCell.source : dataRow[headerCell.source];
					row.cells.push({ value: v || "", header: headerCell });
				});
				rows.push(row);
			});
		});
		return rows;
	}



	const xforms : {[id: string]: (input: any) => AutoTable} = {};
	export function addXform(id: string, xform: (input: any) => AutoTable) {
		if (xforms[id]) console.warn("mmk.autotables.addXform: Overwriting earlier xform",xforms[id],"with new xfrom",xform);
		xforms[id] = xform;
	}
	addXform("[0]",  (a: AutoTable[]) => a[0]);
	addXform("[-1]", (a: AutoTable[]) => a[a.length-1]);



	var generation = 0;
	const ignoreMissingXform : {[id: string]: boolean} = {};
	export function refresh() {
		++generation;
		generation %= 10000;

		let thisGeneration = generation;
		d3.selectAll("table").each(function(){
			let table				= <HTMLTableElement>this;
			let tableRefreshRateMS	= table.getAttribute("mmk-autotable-refresh-ms") || 200;
			let tableSrc			= table.getAttribute("mmk-autotable-src");
			let tableXform			= table.getAttribute("mmk-autotable-xform");
			if (!tableSrc) return;

			var doRefresh = ()=>{};
			doRefresh = ()=>{
				d3.json(tableSrc, (err, data: AutoTable)=>{
					if (err) console.error(table,"mmk.autotables error:",err);
					if (generation === thisGeneration) setTimeout(doRefresh, tableRefreshRateMS);
					if (!data) return;
					if (tableXform) {
						let xform = xforms[tableXform];
						if (!xform) {
							if (!ignoreMissingXform[tableXform]) {
								console.error(table,"mmk.autotables expected xform \""+tableXform+"\" but no such xform function was registered");
								ignoreMissingXform[tableXform] = true;
							}
							return;
						}
						data = xform(data);
						if (!data) data = [];
					}

					let columns : HeaderRow[] = [];
					d3.select(table).select("thead").selectAll("tr").each(function(){
						let tr = <HTMLTableRowElement>this;
						let rowColumns : HeaderRow = { cells: [], class: tr.getAttribute("mmk-autotable-class") };
						// fill rowColumns
						d3.select(tr).selectAll("th,td").each(function(){
							let th = <HTMLTableHeaderCellElement>this;
							let src = th.getAttribute("mmk-autotable-src") || "";
							let cls = th.getAttribute("mmk-autotable-class") || "";
							let raw = src[0] === "=";
							if (raw) src = src.substring(1);
							rowColumns.cells.push({
								rawValue:	raw,
								source:		src,
								class:		cls,
								colSpan:	th.colSpan || 1,
								rowSpan:	th.rowSpan || 1,
							});
						});
						if (rowColumns.cells.some(c => c.source !== "")) columns.push(rowColumns);
					});
					//console.log("mmk.autotables refreshed:", columns);

					let boundData = bindAutoTable(data, columns);

					// TODO: Filter conditions for multi-tbody?
					let d3rows = d3.select(table).select("tbody").selectAll("tr").data(boundData);
					d3rows.enter().append("tr").attr("class", row => row.header.class);
					d3rows.exit().remove();
					d3rows.order();

					let d3cells = d3rows.selectAll("td").data(row => row.cells);
					let d3NewCells = d3cells.enter().append("td");
					d3NewCells.attr("class", cell => cell.header.class);
					d3NewCells.attr("colSpan", cell => cell.header.colSpan);
					d3NewCells.attr("rowSpan", cell => cell.header.rowSpan);

					d3cells.exit().remove();
					// TODO: Non-text cell values (e.g. images?) and filter functions
					d3cells.text(cell => cell.value);
					d3cells.order();
				});
			};
			doRefresh();
		});
	}

	addEventListener("load", refresh);
}}
