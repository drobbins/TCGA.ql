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

  Query.prototype.constrain = function (opts, values) {

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

  Query.prototype.diseases = function (diseaseNames) {
    if (!diseaseNames) {
        //TODO Query and return list of diseases
    } else {
      return this.constrain({ property:"diseaseStudy", variable:"ds" }, diseaseNames);
    }
  };

  Query.prototype.platforms = function (platformNames) {
    if (!platformNames) {
      //TODO Query and return list of platforms
    } else {
      return this.constrain({ property:"platform", variable:"p" }, platformNames);
    }
  };

  Query.prototype.centerTypes = function (centerTypeNames) {
    if (!centerTypeNames) {
      //TODO Query and return list of centerTypes
    } else {
      return this.constrain({ property:"centerType", variable:"ct" }, centerTypeNames);
    }
  };

  Query.prototype.centers = function (centerNames) {
    if (!centerNames) {
      //TODO Query and return list of centers
    } else {
      return this.constrain({ property:"center", variable:"c" }, centerNames);
    }
  };

  Query.prototype.dataTypes = function (dataTypeNames) {
    if (!dataTypeNames) {
      //TODO Query and return list of dataTypes
    } else {
      return this.constrain({ property:"dataType", variable:"dt" }, dataTypeNames);
    }
  };

  Query.prototype.archives = function (archiveNames) {
    if (!archiveNames) {
      //TODO Query and return list of archives
    } else {
      return this.constrain({ property:"archive", variable:"a" }, archiveNames);
    }
  };

  Query.prototype.printQuery = function () {
    var queryString = this.FRONTMATTER;
    this.queryParts.forEach( function (queryPart) {
        queryString += "\n{\n" + queryPart.string + "\n}";
    });
    queryString += this.BACKMATTER;
    console.log(queryString);
    return this;
  };

  tcgaql = function () {
    return new Query();
  };

  tcgaql.Query = Query;

  TCGA.ql = tcgaql;

})();