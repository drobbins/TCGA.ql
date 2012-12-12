(function () {
  "use strict";
  /*jshint globalstrict:true browser:true devel:true jquery:true laxcomma:true proto:true*/
  /*globals TCGA:true*/

  var ql, makeFilter, Query, Filters;

  makeFilter = function makeFilter (property) {
    return function (values) {
      if (!values) {
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
      query += "\n{\n" + queryParts[queryPartId] + "\n}";
    });

    query += this.solutionModifier;
    return query;
  };

  Query.prototype.run = function run () {
    var deferred, result = {};
    deferred = $.Deferred();
    result.__proto__ = deferred.promise(); // The returned object has a promise as it's prototype.
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
    var deferred, result = [], listQueryPart;
    deferred = $.Deferred();
    result.__proto__ = deferred.promise(); // The returned object has a promise as it's prototype.

    this.selectQueryIntro = "select distinct ?val where {";
    this.queryParts.list = "   ?f tcga:"+property.property+" ?"+property.variable+" .\n   ?"+property.variable+" rdfs:label ?val .\n";

    TCGA.find(this.queryString(), function (err, resp) {
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

})();