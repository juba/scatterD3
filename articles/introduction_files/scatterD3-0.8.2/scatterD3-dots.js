// Returns dot size from associated data
function dot_size(d, chart) {
    var size = chart.settings().point_size;
    if (chart.settings().has_size_var) { size = chart.scales().size(d.size_var); }
    return(size);
}


// Filter points and arrows data
function dot_filter(d) {
    return d.type_var === undefined || d.type_var == "point";
}


// Create dots
function dots_create(chart) {

	var chart_body = chart.svg().select(".chart-body")
	var dot = chart_body.selectAll(".dot")
		.data(chart.data().filter(dot_filter), key);
	dot.enter()
		.append("path")
		.call(dot_init, chart)
		.call(dot_formatting, chart);
}

// Update dots
function dots_update(chart) {

	var duration = chart.settings().symbol_lab_changed ? 0 : 1000;

	var chart_body = chart.svg().select(".chart-body")
	var dots = chart_body.selectAll(".dot")
		.data(chart.data().filter(dot_filter), key);
	dots.enter()
	   .append("path")
	   .call(dot_init, chart)
	   .merge(dots)
	   .call(dot_init, chart)
	   .transition().duration(duration)
	   .call(dot_formatting, chart);
	dots.exit()
	   .transition().duration(1000)
	   .attr("transform", "translate(0,0)")
	   .remove();
}




// Initial dot attributes
function dot_init(selection, chart) {

	var settings = chart.settings();
	var scales = chart.scales();

    // tooltips when hovering points
    var tooltip = d3v5.select(".scatterD3-tooltip");
    selection.on("mouseover", function(d, i){
        d3v5.select(this)
            .transition().duration(150)
            .attr("d", d3v5.symbol()
		  .type(function(d) { return scales.symbol(d.symbol_var); })
		  .size(function(d) { return (dot_size(d, chart) * settings.hover_size); })
		 )
            .style("opacity", function(d) {
		if (settings.hover_opacity !== null) {
		    return settings.hover_opacity;
		} else {
		    return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
		}
            });
	if (settings.has_url_var) {
            d3v5.select(this)
		.style("cursor", function(d) {
		    return (d.url_var != "" ? "pointer" : "default");
		});
	}
	if (settings.has_tooltips) {
	    tooltip.style("visibility", "visible")
		    .html(tooltip_content(d, chart));
	}
    });
    selection.on("mousemove", function(){
	if (settings.has_tooltips) {
	    if (settings.tooltip_position_y == "bottom") {
	       tooltip.style("top", (d3v5.event.pageY+15)+"px")
	    } else if (settings.tooltip_position_y == "top") {
	       var tooltip_height = tooltip.node().getBoundingClientRect().height;
	       tooltip.style("top", (d3v5.event.pageY - tooltip_height - 10)+"px")
	    }
	    if (settings.tooltip_position_x == "right") {
	       tooltip.style("left", (d3v5.event.pageX+15)+"px");
	    } else if (settings.tooltip_position_x == "left") {
	       var tooltip_width = tooltip.node().getBoundingClientRect().width;
	       tooltip.style("left", (d3v5.event.pageX - tooltip_width - 10)+"px");
	    }
	}
    });
    selection.on("mouseout", function(){
        d3v5.select(this)
            .transition().duration(150)
            .attr("d", d3v5.symbol()
		  .type(function(d) { return scales.symbol(d.symbol_var); })
		  .size(function(d) { return dot_size(d, chart);})
		 )
            .style("opacity", function(d) {
		return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
	    });
	if (settings.has_tooltips) {
            tooltip.style("visibility", "hidden");
	}
    });
    selection.on("click", function(d, i) {
	if (typeof settings.click_callback === 'function') {
	    settings.click_callback(settings.html_id, i + 1);
	}
	if (settings.has_url_var && d.url_var != "") {
	    var win = window.open(d.url_var, '_blank');
	    win.focus();
	}
    });
}

// Apply format to dot
function dot_formatting(selection, chart) {
    selection
		.attr("transform", function(d) { return translation(d, chart.scales()); })
    	// fill color
        .style("fill", function(d) { return chart.scales().color(d.col_var); })
		.style("opacity", function(d) {
	    	return d.opacity_var !== undefined ? chart.scales().opacity(d.opacity_var) : chart.settings().point_opacity;
		})
    	// symbol and size
        .attr("d", d3v5.symbol()
	      	.type(function(d) { return chart.scales().symbol(d.symbol_var); })
	      	.size(function(d) { return dot_size(d, chart); })
	     )
        .attr("class", function(d,i) {
	    	return "dot symbol symbol-c" + css_clean(d.symbol_var) + " color color-c" + css_clean(d.col_var);
        });
}
