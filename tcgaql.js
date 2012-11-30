(function () {
  "use strict";
  /*jshint globalstrict:true browser:true devel:true jquery:true laxcomma:true*/
  /*globals TCGA:true*/

  var tcgaql, Query;

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

  Query.prototype.FRONTMATTER = [ "PREFIX tcga: <http://purl.org/tcga/core#> "
                                , ""
                                , "select ?file ?url where { "
                                ].join("\n");

  Query.prototype.BACKMATTER = "\n} limit 100";

  Query.prototype.constrain = function constrain (opts, values) {

    var property, variable;

    property = opts.property;
    variable = opts.variable;

    if (typeof values === "string") {
        values = [values];
    }

    var queryPart, graphPatterns = [], groupOrUnionGraphPattern;

    values.forEach(function (value) {
        graphPatterns.push(" {\n   ?f tcga:"+property+" ?"+variable+" .\n   ?"+variable+" rdfs:label \"" + value + "\" .\n }");
    });

    if (graphPatterns.length > 1) {
        groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
    } else {
        groupOrUnionGraphPattern = graphPatterns[0];
    }

    queryPart = this.queryPartHandles[property] || {};
    if (!queryPart.string) {
      this.queryParts.push(queryPart);
      this.queryPartHandles[property] = queryPart;
    }
    queryPart.string = groupOrUnionGraphPattern;

    return this;

  };

  Query.prototype.diseases = function diseases (diseaseNames) {
    if (!diseaseNames) {
        //TODO Query and return list of diseases
    } else {
      return this.constrain({ property:"diseaseStudy", variable:"ds" }, diseaseNames);
    }
  };

  Query.prototype.platforms = function platforms (platformNames) {
    if (!platformNames) {
      //TODO Query and return list of platforms
    } else {
      return this.constrain({ property:"platform", variable:"p" }, platformNames);
    }
  };

  Query.prototype.centerTypes = function centerTypes (centerTypeNames) {
    if (!centerTypeNames) {
      //TODO Query and return list of centerTypes
    } else {
      return this.constrain({ property:"centerType", variable:"ct" }, centerTypeNames);
    }
  };

  Query.prototype.centers = function  centers (centerNames) {
    if (!centerNames) {
      //TODO Query and return list of centers
    } else {
      return this.constrain({ property:"center", variable:"c" }, centerNames);
    }
  };

  Query.prototype.dataTypes = function dataTypes (dataTypeNames) {
    if (!dataTypeNames) {
      //TODO Query and return list of dataTypes
    } else {
      return this.constrain({ property:"dataType", variable:"dt" }, dataTypeNames);
    }
  };

  Query.prototype.archives = function archives (archiveNames) {
    if (!archiveNames) {
      //TODO Query and return list of archives
    } else {
      return this.constrain({ property:"archive", variable:"a" }, archiveNames);
    }
  };

  Query.prototype.printQuery = function printQuery () {
    console.log(this.queryString());
    return this;
  };

  Query.prototype.queryString = function queryString () {
    var query = this.FRONTMATTER;
    this.queryParts.forEach( function (queryPart) {
        query += "\n{\n" + queryPart.string + "\n}";
    });
    query += this.BACKMATTER;
    return query;
  };

  tcgaql = function () {
  Query.prototype.run = function run () {
    var deferred, result = {};
    deferred = $.Deferred();
    result.__proto__ = deferred.promise();
    TCGA.find(this.queryString(), function (err, resp) {
      if (err) deferred.reject(resp);
      else {
        $.extend(result, resp);
        deferred.resolve(resp);
      }
    });
    return result;
  };

    return new Query();
  };

  tcgaql.Query = Query;

  TCGA.ql = tcgaql;

})();