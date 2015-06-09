HTMLWidgets.widget({

  name: 'scatterD3',

  type: 'output',

  initialize: function(el, width, height) {

    var init = {width: width, height: height};
    return init;

  },


    resize: function(el, width, height, instance) {

    },

    
    
  renderValue: function(el, obj, init) {

    var data = obj.data;
    data.labx = data.x;
    data.laby = data.y;
    data = HTMLWidgets.dataframeToD3(data);

    var min_x, min_y, max_x, max_y, x, y, xAxis, yAxis, zoom;

    //d3.select(window).on("resize", throttle);
     
    var margin = {top: 0, right: 0, bottom: 20, left: 20};
    var legend_width = 150;
    if (data[0].var === undefined) legend_width = 0;
    var width = init.width - legend_width;
    var height = init.height;
    if (obj.settings.fixed) {
	height = Math.min(height, width);
	width = height;
    }
    height = height - margin.top - margin.bottom;
    width = width - margin.left - margin.right;
      var total_width = width + margin.left + margin.right + legend_width;
      var total_height = height + margin.top + margin.bottom;

    var labels_size = obj.settings.labels_size;
    var fixed = obj.settings.fixed;

    d3.select(el).select("svg").remove();

    var svg = d3.select(el).append("svg")
      .attr("id", "scatterD3")
      .attr("width", total_width)
      .attr("height", total_height);

    var tooltip = d3.select("body").append("div").attr("class", "tooltip hidden");

    var tooltip_text = function(d) {
	    return Array("<b>"+d.lab+"</b>", "<b>x:</b> "+d.x, "<b>y:</b> "+d.y).join("<br />");
    };

    var color = d3.scale.category10();
      
    function zoomed(reset) {

    	if (!reset) {
		    var t = d3.event.translate;
		    var s = d3.event.scale;
    		zscale = s;
    		t[0] = Math.min(
    			(width/height)  * (s - 1),
    			Math.max( width * (1 - s), t[0] )
    		);
    		t[1] = Math.min(
    			(width/height)  * (s - 1),
    			Math.max( width * (1 - s), t[1] )
    		);
    		zoom.translate(t);
    	}

    	svg.select(".x.axis").call(xAxis);
    	svg.select(".y.axis").call(yAxis);
    	svg.selectAll(".dot").attr("transform", transform);
    	svg.selectAll(".point-label").attr("transform", transform_text);
    	svg.selectAll(".zeroline").remove();
    	add_zerolines();
    }

    function transform(d) {
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    }

    function transform_text(d) {
      return "translate(" + x(d.labx) + "," + y(d.laby) + ")";
    }


    function add_zerolines() {
      var zeroline = d3.svg.line()
    	  .x(function(d) {return x(d.x)})
    	  .y(function(d) {return y(d.y)});
    	chartBody.append("path")
    	    .attr("class", "zeroline hline")
    	    .attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
    	chartBody.append("path")
    	    .attr("class", "zeroline vline")
    	    .attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));
    }

      function add_legend() {

    	svg.append("g")
    		.append("text")
    		.attr("x", total_width - margin.right - legend_width)
    		.attr("y", 90)
    		.style("text-anchor", "beginning")
    		.style("fill", "#000")
    		.style("font-weight", "bold")
    		.text(obj.settings.varlab);


    	var legend = svg.selectAll(".legend")
    		.data(color.domain())
    		.enter().append("g")
    		.attr("class", "legend")
    		.attr("transform", function(d, i) { return "translate(0," + (100 + i * 20) + ")"; });

    	legend.append("rect")
    		.attr("x", total_width - margin.right - legend_width )
    		.attr("width", 18)
    		.attr("height", 18)
    		.attr("class", function(d,i) { return "rectleg color color-" + color(d,i).substring(1)})
    		.style("fill", color)
    		.on("mouseover", function(d,i) {
    			var sel = ".color:not(.color-" + color(d,i).substring(1) + ")";
    			svg.selectAll(sel).transition().style("opacity", 0.2);
    		})
    		.on("mouseout", function(d,i) {
    			var sel = ".color:not(.color-" + color(d,i).substring(1) + ")";
    			svg.selectAll(sel).transition().style("opacity", 1);
    		});

    	legend.append("text")
    		.attr("x", total_width - margin.right - legend_width + 24)
    		.attr("y", 9)
    		.attr("dy", ".35em")
    		.style("text-anchor", "beginning")
    		.style("fill", "#000")
    		.attr("class", function(d,i) { return "color color-" + color(d,i).substring(1)})
    		.text(function(d) { return d; });

	  
      }

      function draw() {

	  x = d3.scale.linear().range([0, width]);
	  y = d3.scale.linear().range([height, 0]);
	  zoom = d3.behavior.zoom()
	      .x(x)
	      .y(y)
	      .scaleExtent([1, 32])
	      .on("zoom", zoomed);

	  if (fixed) {
	    min_x = min_y = d3.min(data, function(d) { return Math.min(d.x,d.y);} );
	    max_x = max_y = d3.max(data, function(d) { return Math.max(d.x,d.y);} );
	} else {
	    min_x = d3.min(data, function(d) { return Math.min(d.x);} );
	    max_x = d3.max(data, function(d) { return Math.max(d.x);} );
	    min_y = d3.min(data, function(d) { return Math.min(d.y);} );
	    max_y = d3.max(data, function(d) { return Math.max(d.y);} );
	}
	gap_x = (max_x - min_x) * 0.2;
	gap_y = (max_y - min_y) * 0.2;
	x.domain([min_x - gap_x, max_x + gap_x]);
	y.domain([min_y - gap_y, max_y + gap_y]);
	zoom.x(x);
	  zoom.y(y);




      svg = svg.append("g")
		    .style("fill", "#FFF")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    svg.append("clipPath")
		    .attr('id', 'clip')
		    .append('rect')
		    .style("stroke-width", 0)
		    .attr('width', width)
		    .attr('height', height);

	    xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
		    .tickSize(-height);

	    yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .tickSize(-width);

    	svg.append("g")
    		.attr("class", "x axis")
    		.attr("transform", "translate(0," + height + ")")
    		.call(xAxis)
    		.append("text")
    		   .attr("class", "label")
    		   .attr("x", width - 5)
    		   .attr("y", -6)
    		   .style("text-anchor", "end")
    		   .text(obj.settings.xlab);

    	svg.append("g")
    		.attr("class", "y axis")
    		.call(yAxis)
    		.append("text")
    		   .attr("class", "label")
    		   .attr("transform", "rotate(-90)")
    		   .attr("x", -5)
       		   .attr("y", 6)
    		   .attr("dy", ".71em")
    		   .style("text-anchor", "end")
    		   .text(obj.settings.ylab);

    	svg.append("rect")
    		.attr("class", "pane")
    		.attr("width", width)
    		.attr("height", height)
    		.style("cursor", "move")
    		.style("fill", "none")
    		.style("pointer-events", "all")
    		.call(zoom);

    	chartBody = svg.append("g")
    		.attr("width", width)
    		.attr("height", height)
    		.attr("clip-path", "url(#clip)");

    	add_zerolines();

	var point = d3.svg.symbol()
    	    .type("circle")
    	    .size(64);
	
    	var dot = chartBody.selectAll(".dot").data(data);

    	dot.enter().append("path")
    		.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
    		.attr("class", function(d) { return "dot "+"color color-" + color(d.var).substring(1); })
    		.style("fill", function(d) { return color(d.var); })
    		.style("stroke", "#FFF")
    		.attr("d", point);

    	var offsetL = el.offsetLeft+40;
    	var offsetT = el.offsetTop+40;


    	//tooltips
    	dot.on("mousemove", function(d,i) {
    	    var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
    	    tooltip.classed("hidden", false)
    		.attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
    		.html(tooltip_text(d));})
    	    .on("mouseout",  function(d,i) {
    		tooltip.classed("hidden", true);
    	    });

    	var drag = d3.behavior.drag()
    		.on('dragstart', function(d) { d3.select(this).style('font-weight', 'bold'); })
    		.on('drag', function(d) {
    			d3.select(this).attr('transform', "translate("+d3.event.x+","+d3.event.y+")");
    			d.labx = x.invert(d3.event.x);
    			d.laby = y.invert(d3.event.y);
    		})
    		.on('dragend', function(d) { d3.select(this).style('font-weight', 'normal'); });

    	chartBody.selectAll(".point-label")
    		.data(data)
    		.enter().append("text")
    		.attr("class", function(d) { return "point-label " + "color color-" + color(d.var).substring(1); })
    		.attr("transform", function(d) { return "translate(" + x(d.labx) + "," + y(d.laby) + ")"; })
    		.style("fill", function(d) { return color(d.var); })
    		.style("font-size", labels_size + "px")
    		.attr("text-anchor", "middle")
    		.attr("dy", "-1.3ex")
    		.text(function(d) {return(d.lab)})
    	    .call(drag);

	if (data[0].var !== undefined) add_legend();

      }

      draw();

      function redraw() {
	  height = window.innerHeight - margin.top - margin.bottom;
    	  width = window.innerHeight - margin.left - margin.right;
	  d3.selectAll('svg').remove();
	  draw();
      }



    var throttleTimer;
    function throttle() {
      window.clearTimeout(throttleTimer);
        throttleTimer = window.setTimeout(function() {
          redraw();
        }, 200);
    }


    d3.select("#resetzoom").on("click", reset_zoom);

    function reset_zoom() {
      d3.transition().duration(750).tween("zoom", function() {
        var ix = d3.interpolate(x.domain(), [min*1.4, max*1.4]),
            iy = d3.interpolate(y.domain(), [min*1.4, max*1.4]);
        return function(t) {
          zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
          zoomed(reset=true);
        };
      });
    }

    d3.select("#varsize").on("change", function() {
      labels_size = this.value;
      console.log(labels_size);
      d3.selectAll(".point-label")
    		.style("font-size", labels_size + "px");
    });

    d3.select("#download")
    	.on("mouseover", function(){
    		var html = d3.select("svg#mcavar")
    			.attr("version", 1.1)
    			.attr("xmlns", "http://www.w3.org/2000/svg")
    			.node().parentNode.innerHTML;

    		d3.select(this)
    			.attr("href-lang", "image/svg+xml")
    			.attr("href", "data:image/svg+xml;base64,\n" + btoa(html));
    	});
  }

   
});
