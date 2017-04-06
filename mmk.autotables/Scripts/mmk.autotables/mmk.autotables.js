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
var mmk;
(function (mmk) {
    var autotables;
    (function (autotables) {
        function bindAutoTable(data, headerRows) {
            var rows = [];
            data.forEach(function (dataRow) {
                headerRows.forEach(function (headerRow) {
                    var row = { header: headerRow, cells: [] };
                    headerRow.cells.forEach(function (headerCell) {
                        var v = headerCell.rawValue ? headerCell.source : dataRow[headerCell.source];
                        row.cells.push({ value: v || "", header: headerCell });
                    });
                    rows.push(row);
                });
            });
            return rows;
        }
        var xforms = {};
        function addXform(id, xform) {
            if (xforms[id])
                console.warn("mmk.autotables.addXform: Overwriting earlier xform", xforms[id], "with new xfrom", xform);
            xforms[id] = xform;
        }
        autotables.addXform = addXform;
        addXform("[0]", function (a) { return a[0]; });
        addXform("[-1]", function (a) { return a[a.length - 1]; });
        var generation = 0;
        var ignoreMissingXform = {};
        function refresh() {
            ++generation;
            generation %= 10000;
            var thisGeneration = generation;
            d3.selectAll("table").each(function () {
                var table = this;
                var tableRefreshRateMS = table.getAttribute("mmk-autotable-refresh-ms") || 200;
                var tableSrc = table.getAttribute("mmk-autotable-src");
                var tableXform = table.getAttribute("mmk-autotable-xform");
                if (!tableSrc)
                    return;
                var doRefresh = function () { };
                doRefresh = function () {
                    d3.json(tableSrc, function (err, data) {
                        if (err)
                            console.error(table, "mmk.autotables error:", err);
                        if (generation === thisGeneration)
                            setTimeout(doRefresh, tableRefreshRateMS);
                        if (!data)
                            return;
                        if (tableXform) {
                            var xform = xforms[tableXform];
                            if (!xform) {
                                if (!ignoreMissingXform[tableXform]) {
                                    console.error(table, "mmk.autotables expected xform \"" + tableXform + "\" but no such xform function was registered");
                                    ignoreMissingXform[tableXform] = true;
                                }
                                return;
                            }
                            data = xform(data);
                            if (!data)
                                data = [];
                        }
                        var columns = [];
                        d3.select(table).select("thead").selectAll("tr").each(function () {
                            var tr = this;
                            var rowColumns = { cells: [], class: tr.getAttribute("mmk-autotable-class") };
                            // fill rowColumns
                            d3.select(tr).selectAll("th,td").each(function () {
                                var th = this;
                                var src = th.getAttribute("mmk-autotable-src") || "";
                                var cls = th.getAttribute("mmk-autotable-class") || "";
                                var raw = src[0] === "=";
                                if (raw)
                                    src = src.substring(1);
                                rowColumns.cells.push({
                                    rawValue: raw,
                                    source: src,
                                    class: cls,
                                    colSpan: th.colSpan || 1,
                                    rowSpan: th.rowSpan || 1,
                                });
                            });
                            if (rowColumns.cells.some(function (c) { return c.source !== ""; }))
                                columns.push(rowColumns);
                        });
                        //console.log("mmk.autotables refreshed:", columns);
                        var boundData = bindAutoTable(data, columns);
                        // TODO: Filter conditions for multi-tbody?
                        var d3rows = d3.select(table).select("tbody").selectAll("tr").data(boundData);
                        d3rows.enter().append("tr").attr("class", function (row) { return row.header.class; });
                        d3rows.exit().remove();
                        d3rows.order();
                        var d3cells = d3rows.selectAll("td").data(function (row) { return row.cells; });
                        var d3NewCells = d3cells.enter().append("td");
                        d3NewCells.attr("class", function (cell) { return cell.header.class; });
                        d3NewCells.attr("colSpan", function (cell) { return cell.header.colSpan; });
                        d3NewCells.attr("rowSpan", function (cell) { return cell.header.rowSpan; });
                        d3cells.exit().remove();
                        // TODO: Non-text cell values (e.g. images?) and filter functions
                        d3cells.text(function (cell) { return cell.value; });
                        d3cells.order();
                    });
                };
                doRefresh();
            });
        }
        autotables.refresh = refresh;
        addEventListener("load", refresh);
    })(autotables = mmk.autotables || (mmk.autotables = {}));
})(mmk || (mmk = {}));
//# sourceMappingURL=mmk.autotables.js.map