# mmk.autotables

MaulingMonKey's basic d3 based API for dynamically updating a table from a JSON data source based on HTML configuration.

License: [Apache 2.0](LICENSE.txt)

# Example

[index.html](mmk.autotables/index.html)
```html
<script src="Scripts/d3/d3.js"></script>
<script src="Scripts/mmk.autotables/mmk.autotables.js"></script>
...
<table mmk-autotable-refresh-ms="100" mmk-autotable-src="res/array-array-objects.json" mmk-autotable-xform="[0]"><thead><tr>
	<th mmk-autotable-src="name" >Name</th>
	<th mmk-autotable-src="state">State</th>
</tr></thead><tbody>
	<!-- autoTables.ts -->
</tbody></table>
```

[array-array-objects.json](mmk.autotables/res/array-array-objects.json)
```json
[
	[{ "name": "a name #1", "state": "a state #1" }
	,{ "name": "a name #2", "state": "a state #2" }
	,{ "name": "a name #3", "state": "a state #3" }
	],

	[],

	[{ "name": "a name #4", "state": "a state #4" }
	,{ "name": "a name #5", "state": "a state #5" }
	,{ "name": "a name #6", "state": "a state #6" }
	]
]
```

Result

| Name | State |
| ---- | ----- |
| a name #1 | a state #1 |
| a name #2 | a state #2 |
| a name #3 | a state #3 |


# TODO
* Opt-in cachebusting?
* Opt-in autorefresh of tables list/configuration?
* Per-column text transforms (.toLowerCase())
* Per-column non-text transforms (e.g. to icons - HTML? d3 based? TBD)
* Per-tbody table selections (/ transforms?)
* More advanced column sources (e.g. no manual registration to specify "foo.bar.name", "foo[0].bar[1].name", etc.)
* More advanced built in table transforms (ditto)

# Installation

## Via NuGet
<strike>Add [mmk.autotables](https://www.nuget.org/packages/mmk.autotables/) to your project via nuget.  Done!</strike> **Soon(tm)**
