(function () {
  "use strict";
  /*jshint globalstrict:true browser:true devel:true jquery:true laxcomma:true proto:true*/
  /*globals TCGA:true*/

  var ql, makeFilter, Query, Filters;

  makeFilter = function makeFilter (property) {
    return function (values) {
      if (!values) {
        this.constrain(property);
        return this.list(property);
      } else {
        return this.constrain(property, values);
      }
    };
  };

  Filters = {
    diseases : { property:"diseaseStudy", variable:"ds" },
    centerTypes : { property:"centerType", variable:"ct" },
    centers : { property:"centerDomain", variable:"c"},
    platforms : { property:"platform", variable:"p"},
    dataTypes : { property:"dataType", variable:"dt"},
    archives : { property:"archive", variable:"a"}
  };

  Query = function () {
    this.prologue = "PREFIX tcga: <http://purl.org/tcga/core#> \n";
    this.solutionModifier = "\n} limit 100";
    this.selectQueryIntro = "select ?file ?url where {";

    this.queryParts = {};

    this.queryParts.fileGraphPatterns = " ?f a tcga:File .\n ?f rdfs:label ?file .\n ?f tcga:url ?url .";

    return this;
  };

  Query.prototype.constrain = function constrain (opts, values) {

    var property, variable;

    property = opts.property;
    variable = opts.variable;

    if (!values || values.length === 0) {
      this.queryParts[property] = null;
      return this;
    }

    if (typeof values === "string") {
      values = [values];
    }

    var queryPart, graphPatterns = [], groupOrUnionGraphPattern;

    values.forEach(function (value) {
      graphPatterns.push(" {\n   ?" + variable + " rdfs:label \"" + value + "\" .\n }");
    });

    if (graphPatterns.length > 1) {
      groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
    } else {
      groupOrUnionGraphPattern = graphPatterns[0];
    }

    groupOrUnionGraphPattern = " ?f tcga:"+property+" ?"+variable+" .\n"+groupOrUnionGraphPattern;
    this.queryParts[property] = groupOrUnionGraphPattern;

    return this;
  };

  Query.prototype.filterNames = [];

  Object.keys(Filters).forEach( function (constraint) {
    Query.prototype[constraint] = makeFilter(Filters[constraint]);
    Query.prototype.filterNames.push(constraint);
  });

  Query.prototype.limit = function  limit (newLimit) {
    if (!newLimit) return parseInt(this.solutionModifier.slice(9),10);
    this.solutionModifier = "\n} limit " + newLimit;
    return this;
  };

  Query.prototype.printQuery = function printQuery () {
    console.log(this.queryString());
    return this;
  };

  Query.prototype.queryString = function queryString () {
    var query = "", queryParts;

    query += this.prologue;
    query += this.selectQueryIntro;

    queryParts = this.queryParts; // capture query parts for closure
    Object.keys(queryParts).forEach( function (queryPartId) {
      if (queryParts[queryPartId]) {
        query += "\n{\n" + queryParts[queryPartId] + "\n}";
      }
    });

    query += this.solutionModifier;
    return query;
  };

  Query.prototype.run = function run () {
    var deferred, result;
    deferred = $.Deferred();
    result = Object.create(deferred.promise()); // The returned object has a promise as it's prototype.

    TCGA.find(this.queryString(), function (err, resp) {
      if (err) deferred.reject(resp);
      else {
        $.extend(result, resp); // Extend the returned object with the response from the server.
        deferred.resolve(resp);
      }
    });

    return result;
  };

  Query.prototype.list = function list (property) {
    var deferred, result, listQueryPart, that, defaultSelectQueryIntro;
    deferred = $.Deferred();
    result = Object.create(deferred.promise()); // The returned object has a promise as it's prototype.

    defaultSelectQueryIntro = this.selectQueryIntro;
    that = this;
    this.selectQueryIntro = "select distinct ?val where {";
    this.queryParts.list = "   ?f tcga:"+property.property+" ?"+property.variable+" .\n   ?"+property.variable+" rdfs:label ?val .\n";

    TCGA.find(this.queryString(), function (err, resp) {
      that.selectQueryIntro = defaultSelectQueryIntro;
      that.queryParts.list = null;
      if (err) deferred.reject(resp);
      else {
        resp.results.bindings.forEach(function (binding) {
          Array.prototype.push.call(result, binding.val.value);
        });
        deferred.resolve(result);
      }
    });
    
    return result;
  };

  ql = function () {
    return new Query();
  };

  TCGA.Query = Query;

  TCGA.__defineGetter__("ql", ql);

  TCGA.ui.registerTab({
    id : "tcga-ql",
    title : "TCGA.ql Docs",
    content : '<h1 id="tcga.ql">TCGA.ql</h1><p>TCGA.ql is a prototype query builder and DSL for finding data files in the TCGA’s open access HTTP repository, built as a component for the <a href="https://github.com/tcga/web-toolbox">TCGA Toolbox</a>.</p><p><a href="http://tcga.github.com/?module=https://raw.github.com/drobbins/TCGA.ql/master/tcgaql.js">Load TCGA.ql in TCGA Toolbox</a></p><h1 id="usage">Usage</h1><p>First, create a query object:</p><pre><code>// Using the TCGA.ql getter\nquery=TCGA.ql;\n\n// Alternately, use the "new"keyword\nquery=new TCGA.Query;</code></pre><p>Add constraints to the object:</p><pre><code>query.diseases(["brca", "gbm"]).dataTypes("protein_exp");</code></pre><p>Run the query:</p><pre><code>results=query.run();\n\n// The results object is a jQuery promise\nresults.done( function (){processResults(results);});\n\n// Promise callbacks may also take arguments\nresults.done( function (data){processData(data);});</code></pre><p>To see the list of possible constraints for a given filter, run the filter without any arguments:</p><pre><code>allDiseases=q.diseases();\ndiseasesWithRPPAData=q.dataTypes("protein_exp").diseases();\n\n// These lists of constraints are also jQuery promises\ndiseasesWithRPPAData.done(function (){//...});</code></pre><h2 id="queryq">Query (q)</h2><h3 id="q.filternames">q.filterNames</h3><p>Array containing the list of filters available for this query.</p><h3 id="q.filter_nameconstraints">q.<filter_name>( constraints )</h3><p>Add the named filter to the query. <code>constraints</code> may be a string or array of strings. Passing an empty array clears the filter.</p><p>Returns:</p><ul><li>If no <code>constraints</code> are given, an jQuery promise for all possible constraints on this filter is returned.</li><li>Otherwise, returns the query object, allowing filters to be chained.</li></ul><h3 id="q.querystring">q.queryString()</h3><p>Returns the current SPARQL query representing the active filters.</p><h3 id="q.printquery">q.printQuery()</h3><p><code>console.log</code> the current SPARQL query.</p><h3 id="q.run">q.run()</h3><p>Execute the current SPARQL query, returning a <a href="http://www.w3.org/TR/sparql11-results-json/#json-result-object"><code>application/sparql-results+json</code></a> with the results.</p><p>The returned object has an a jQuery promise as it’s prototype.</p>',
    switchTab : true
  }, function () {
    console.log("TCGA.ql Loaded.");
  });

})();