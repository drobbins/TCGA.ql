# TCGA.ql

TCGA.ql is a prototype query builder and DSL for finding data files in the TCGA's open access HTTP repository, built as a component for the [TCGA Toolbox](https://github.com/tcga/web-toolbox).

[Load TCGA.ql in TCGA Toolbox](http://tcga.github.com/?module=https://raw.github.com/drobbins/TCGA.ql/master/tcgaql.js)

# Usage

First, create a query object:

```
// Using the TCGA.ql getter
query = TCGA.ql;

// Alternately, use the "new" keyword
query = new TCGA.Query;
```

Add constraints to the object:

```
query.diseases(["brca", "gbm"]).dataTypes("protein_exp");
```

Run the query:

```
results = query.run();


// The results object is a jQuery promise
results.done( function () {
  processResults(results);
});

// Promise callbacks may also take arguments
results.done( function (data) {
  processData(data);
});
```

To see the list of possible constraints for a given filter, run the filter without any arguments:

```
allDiseases = q.diseases();

diseasesWithRPPAData = q.dataTypes("protein_exp").diseases();

// These lists of constraints are also jQuery promises
diseasesWithRPPAData.done(function () {
  //...
});
```

## Query (q)

### q.filterNames

Array containing the list of filters available for this query.

### q.<filter_name>( constraints )

Add the named filter to the query. ``constraints`` may be a string or array of strings. Passing an empty array clears the filter.

Returns:

* If no ``constraints`` are given, an jQuery promise for all possible constraints on this filter is returned.
* Otherwise, returns the query object, allowing filters to be chained.

### q.queryString()

Returns the current SPARQL query representing the active filters.

### q.printQuery()

``console.log`` the current SPARQL query.

### q.run()

Execute the current SPARQL query, returning a [``application/sparql-results+json``](http://www.w3.org/TR/sparql11-results-json/#json-result-object) with the results.

The returned object has an a jQuery promise as it's prototype.