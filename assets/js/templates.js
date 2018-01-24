this["fac"] = this["fac"] || {};
this["fac"]["hello"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<h1>"
    + this.escapeExpression(((helper = (helper = helpers.flo || (depth0 != null ? depth0.flo : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"flo","hash":{},"data":data}) : helper)))
    + "</h1>\n\n\n";
},"useData":true});