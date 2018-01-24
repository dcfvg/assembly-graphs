var txTVA = 10;
var base = {};
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var onCsv = function (csvs){

  console.log(csvs.length, "ranges found");

  var papaConf = {
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
    dynamicTyping: true,
  };


  var projects =
    _.map(Papa.parse(csvs[0], papaConf).data, function(p){

      p.tags_gesture = tagExtract(p.tags_gesture);
      p.tags_subjects = tagExtract(p.tags_subjects);

      return p;
    })

  base = {
    projects: projects
  }

  init(base);
}

function init(base){
  console.log(base);

  var graph = {nodes:[], links:[]}

  var tagsCount = _(base.projects).map(function(p){
    return p.tags_gesture
  }).flatten().countBy().value();

  console.log(tagsCount);


  var nodes = _(base.projects).map(function(p){
    return p.tags_gesture
  }).flatten().uniq().map((t,i) => {
    return  {
      "name": t,
      "label": "",
      "id": i,
      "degree": tagsCount[t]
    }
  }).filter((tag) => {
    return tagsCount[tag.name] > 1;
  })
  .value();

  console.log(nodes)

  graph.nodes = nodes;

  _(base.projects).map((p) => {
    return p.tags_gesture
  }).forEach((tags) => {
    var newLinks = [];
    _.forEach(tags, (tagSource) => {
      _.forEach(tags, (tagTarget) => {

        var source = _.find(graph.nodes, {'name':tagSource});
        var target = _.find(graph.nodes, {'name':tagTarget});

        if(!_.isUndefined(source) &&  !_.isUndefined(target)){
          graph.links.push({
              "source":source.id ,
              "target":target.id ,
              "type": "",
              "since": 2010
            })
        }

      })
    })

  }).value();

  console.log(graph);


  update(graph.links, graph.nodes);


}


// D3
    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    var chartDiv = document.getElementById("chart");

    var divwidth = chartDiv.clientWidth;
    var divheight = chartDiv.clientHeight;

    var svg = d3.select(chartDiv).append("svg")
            .attr('width',divwidth).attr('height',divheight),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        node,
        link;

    svg.append('defs').append('marker')
        .attrs({'id':'arrowhead',
            'viewBox':'-0 -5 10 10',
            'refX':5,
            'refY':0,
            'orient':'auto',
            'markerWidth':5,
            'markerHeight':5,
            'xoverflow':'visible'})
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke','none');

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(100).strength(1))
        .force("charge", d3.forceManyBody().strength(-5000).distanceMin(100).distanceMax(1000) )
        .force("center", d3.forceCenter(width / 2, height / 2));


    function update(links, nodes) {
        link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr('marker-end','url(#arrowhead)')

        link.append("title")
            .text(function (d) {return d.type;});

        edgepaths = svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attrs({
                'class': 'edgepath',
                'fill-opacity': 0,
                'stroke-opacity': 0.5,
                'id': function (d, i) {return 'edgepath' + i}
            })
            .style("pointer-events", "none");

        // edgelabels = svg.selectAll(".edgelabel")
        //     .data(links)
        //     .enter()
        //     .append('text')
        //     .style("pointer-events", "none")
        //     .attrs({
        //         'class': 'edgelabel',
        //         'id': function (d, i) {return 'edgelabel' + i},
        //         'font-size': 10,
        //         'fill': '#aaa'
        //     });

        // edgelabels.append('textPath')
        //     .attr('xlink:href', function (d, i) {return '#edgepath' + i})
        //     .style("text-anchor", "middle")
        //     .style("pointer-events", "none")
        //     .attr("startOffset", "50%")
        //     .text(function (d) {return d.type});

        node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );

        node.append("circle")
            .attr("r", function(d,i){ return d.degree * 2} )
            .style("fill", function (d, i) {return colors(i);})

        node.append("title")
            .text(function (d) {return d.id;});

        node.append("text")
            .attr("dx", function(d,i){ return d.degree * 2.2} )
            .attr("dy", function(d,i){ return d.degree } )
            .text(function (d) {return d.name+" "+d.label;});

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);
    }

    function ticked() {
        link
            .attr("x1", function (d) {return d.source.x;})
            .attr("y1", function (d) {return d.source.y;})
            .attr("x2", function (d) {return d.target.x;})
            .attr("y2", function (d) {return d.target.y;});

        node
            .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

        edgepaths.attr('d', function (d) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        });

        // edgelabels.attr('transform', function (d) {
        //     if (d.target.x < d.source.x) {
        //         var bbox = this.getBBox();

        //         rx = bbox.x + bbox.width / 2;
        //         ry = bbox.y + bbox.height / 2;
        //         return 'rotate(180 ' + rx + ' ' + ry + ')';
        //     }
        //     else {
        //         return 'rotate(0)';
        //     }
        // });
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

   function dragended(d) {
       if (!d3.event.active) simulation.alphaTarget(0);
       d.fx = undefined;
       d.fy = undefined;
   }

// end D3




// extract tags separated by slash in the spreadsheet
function tagExtract(tagSring){
  return _.compact(_.map(tagSring.split("/"), function(t){return _.trim(t)}));
}
