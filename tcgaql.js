(function () {
  "use strict";
  /*jshint globalstrict:true browser:true devel:true jquery:true laxcomma:true proto:true*/
  /*globals TCGA:true*/

  var ql, makeFilter, Query, Properties;

  makeFilter = function makeFilter (property) {
    return function (values) {
      if (!values) {
        return this.list(property);
      } else {
        return this.constrain(property, values);
      }
    };
  };

  Properties = {
    diseaseStudy : { property:"diseaseStudy", variable:"ds" },
    centerType : { property:"centerType", variable:"ct" },
    centerDomain : { property:"centerDomain", variable:"c"},
    platform : { property:"platform", variable:"p"},
    dataType : { property:"dataType", variable:"dt"},
    archive : { property:"archive", variable:"a"}
  };

  Query = function () {

    this.queryParts = [];
    this.queryPartHandles = {};

    var queryIntro = {
      string : " ?f a tcga:File .\n ?f rdfs:label ?file .\n ?f tcga:url ?url ."
    };

    this.queryParts.push(queryIntro);
    this.queryPartHandles.intro = queryIntro;

    return this;
  };

  Query.prototype.FRONTMATTER = "PREFIX tcga: <http://purl.org/tcga/core#> \n";

  Query.prototype.BACKMATTER = "\n} limit 100";

  Query.prototype.SELECTCLAUSE = "";

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

    queryPart = this.queryPartHandles[property] || {};
    if (!queryPart.string) {
      this.queryParts.push(queryPart);
      this.queryPartHandles[property] = queryPart;
    }
    queryPart.string = groupOrUnionGraphPattern;

    return this;
  };

  Query.prototype.diseases = makeFilter(Properties.diseaseStudy);

  Query.prototype.platforms = makeFilter(Properties.platform);

  Query.prototype.centerTypes = makeFilter(Properties.centerType);

  Query.prototype.centers = makeFilter(Properties.centerDomain);

  Query.prototype.dataTypes = makeFilter(Properties.dataType);

  Query.prototype.archives = makeFilter(Properties.archive);

  Query.prototype.limit = function  limit (newLimit) {
    if (!newLimit) return parseInt(this.BACKMATTER.slice(9),10);
    this.BACKMATTER = "\n} limit " + newLimit;
    return this;
  };

  Query.prototype.printQuery = function printQuery () {
    console.log(this.queryString());
    return this;
  };

  Query.prototype.queryString = function queryString () {
    var query = this.FRONTMATTER;
    this.SELECTCLAUSE = this.SELECTCLAUSE || "select ?file ?url where {";
    query += this.SELECTCLAUSE;
    this.queryParts.forEach( function (queryPart) {
      query += "\n{\n" + queryPart.string + "\n}";
    });
    query += this.BACKMATTER;
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

    this.SELECTCLAUSE = "select distinct ?val where {";
    listQueryPart = {
      string : "   ?f tcga:"+property.property+" ?"+property.variable+" .\n   ?"+property.variable+" rdfs:label ?val .\n"
    };
    this.queryParts.push(listQueryPart);
    this.queryPartHandles.list = listQueryPart;

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

  ql.Query = Query;

  TCGA.qlObj = ql;

  TCGA.__defineGetter__("ql", ql);

})();