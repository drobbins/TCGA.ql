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

  Query.prototype.BACKMATTER = "\n}";

  Query.prototype.apes = function (opts, values) {

    var property, variable;

    if (typeof values === "string") {
        values = [values];
    }

    var queryPart, graphPatterns = [], groupOrUnionGraphPattern;

    values.forEach(function (disease) {
        graphPatterns.push(" {\n   ?f tcga:diseaseStudy ?ds .\n   ?ds rdfs:label \"" + disease + "\" .\n }");
    });

    if (graphPatterns.length > 1) {
        groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
    } else {
        groupOrUnionGraphPattern = graphPatterns[0];
    }

    queryPart = this.queryPartHandles.diseases || {};
    if (!queryPart.string) {
      this.queryParts.push(queryPart);
      this.queryPartHandles.diseases = queryPart;
    }
    queryPart.string = groupOrUnionGraphPattern;

  };

  Query.prototype.diseases = function (diseaseNames) {

    if (!diseaseNames) {

        //TODO Query and return list of diseases

    } else {

        if (typeof diseaseNames === "string") {
            diseaseNames = [diseaseNames];
        }

        var diseaseQueryPart, graphPatterns = [], groupOrUnionGraphPattern;

        diseaseNames.forEach(function (disease) {
            graphPatterns.push(" {\n   ?f tcga:diseaseStudy ?ds .\n   ?ds rdfs:label \"" + disease + "\" .\n }");
        });

        if (graphPatterns.length > 1) {
            groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
        } else {
            groupOrUnionGraphPattern = graphPatterns[0];
        }

        diseaseQueryPart = this.queryPartHandles.diseases || {};
        if (!diseaseQueryPart.string) {
          this.queryParts.push(diseaseQueryPart);
          this.queryPartHandles.diseases = diseaseQueryPart;
        }
        diseaseQueryPart.string = groupOrUnionGraphPattern;
    }

    return this;

  };

  Query.prototype.platforms = function (platformNames) {

    if (!platformNames) {

        //TODO Query and return list of platforms

    } else {

        if (typeof platformNames === "string") {
            platformNames = [platformNames];
        }

        var platformQueryPart, graphPatterns = [], groupOrUnionGraphPattern;

        platformNames.forEach(function (platform) {
            graphPatterns.push(" {\n   ?f tcga:platform ?p .\n   ?p rdfs:label \"" + platform + "\" .\n }");
        });

        if (graphPatterns.length > 1) {
            groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
        } else {
            groupOrUnionGraphPattern = graphPatterns[0];
        }

        platformQueryPart = this.queryPartHandles.platforms || {};
        if (!platformQueryPart.string) {
          this.queryParts.push(platformQueryPart);
          this.queryPartHandles.platforms = platformQueryPart;
        }
        platformQueryPart.string = groupOrUnionGraphPattern;
    }

    return this;

  };

  Query.prototype.dataTypes = function (dataTypeNames) {

    if (!dataTypeNames) {

        //TODO Query and return list of dataTypes

    } else {

        if (typeof dataTypeNames === "string") {
            dataTypeNames = [dataTypeNames];
        }

        var dataTypeQueryPart, graphPatterns = [], groupOrUnionGraphPattern;

        dataTypeNames.forEach(function (dataType) {
            graphPatterns.push(" {\n   ?f tcga:dataType ?dt .\n   ?dt rdfs:label \"" + dataType + "\" .\n }");
        });

        if (graphPatterns.length > 1) {
            groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
        } else {
            groupOrUnionGraphPattern = graphPatterns[0];
        }

        dataTypeQueryPart = this.queryPartHandles.dataTypes || {};
        if (!dataTypeQueryPart.string) {
          this.queryParts.push(dataTypeQueryPart);
          this.queryPartHandles.dataTypes = dataTypeQueryPart;
        }
        dataTypeQueryPart.string = groupOrUnionGraphPattern;
    }

    return this;

  };

  Query.prototype.archives = function (archiveNames) {

    if (!archiveNames) {

        //TODO Query and return list of archives

    } else {

        if (typeof archiveNames === "string") {
            archiveNames = [archiveNames];
        }

        var archiveQueryPart, graphPatterns = [], groupOrUnionGraphPattern;

        archiveNames.forEach(function (archive) {
            graphPatterns.push(" {\n   ?f tcga:archive ?a .\n   ?a rdfs:label \"" + archive + "\" .\n }");
        });

        if (graphPatterns.length > 1) {
            groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
        } else {
            groupOrUnionGraphPattern = graphPatterns[0];
        }

        archiveQueryPart = this.queryPartHandles.archives || {};
        if (!archiveQueryPart.string) {
          this.queryParts.push(archiveQueryPart);
          this.queryPartHandles.archives = archiveQueryPart;
        }
        archiveQueryPart.string = groupOrUnionGraphPattern;
    }

    return this;

  };

  Query.prototype.centers = function (centerNames) {

    if (!centerNames) {

        //TODO Query and return list of centers

    } else {

        if (typeof centerNames === "string") {
            centerNames = [centerNames];
        }

        var centerQueryPart, graphPatterns = [], groupOrUnionGraphPattern;

        centerNames.forEach(function (center) {
            graphPatterns.push(" {\n   ?f tcga:centerDomain ?cd .\n   ?cd rdfs:label \"" + center + "\" .\n }");
        });

        if (graphPatterns.length > 1) {
            groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
        } else {
            groupOrUnionGraphPattern = graphPatterns[0];
        }

        centerQueryPart = this.queryPartHandles.centers || {};
        if (!centerQueryPart.string) {
          this.queryParts.push(centerQueryPart);
          this.queryPartHandles.centers = centerQueryPart;
        }
        centerQueryPart.string = groupOrUnionGraphPattern;
    }

    return this;

  };

  Query.prototype.centerTypes = function (centerTypeNames) {

    if (!centerTypeNames) {

        //TODO Query and return list of centerTypes

    } else {

        if (typeof centerTypeNames === "string") {
            centerTypeNames = [centerTypeNames];
        }

        var centerTypeQueryPart, graphPatterns = [], groupOrUnionGraphPattern;

        centerTypeNames.forEach(function (centerType) {
            graphPatterns.push(" {\n   ?f tcga:centerType ?ct .\n   ?ct rdfs:label \"" + centerType + "\" .\n }");
        });

        if (graphPatterns.length > 1) {
            groupOrUnionGraphPattern = graphPatterns.join("\n UNION\n");
        } else {
            groupOrUnionGraphPattern = graphPatterns[0];
        }

        centerTypeQueryPart = this.queryPartHandles.centerTypes || {};
        if (!centerTypeQueryPart.string) {
          this.queryParts.push(centerTypeQueryPart);
          this.queryPartHandles.centerTypes = centerTypeQueryPart;
        }
        centerTypeQueryPart.string = groupOrUnionGraphPattern;
    }

    return this;

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