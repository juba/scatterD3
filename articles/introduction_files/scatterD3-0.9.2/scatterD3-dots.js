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
    var tooltip = d3v6.select(".scatterD3-tooltip");
    selection.on("mouseover", (event, d) => {
        d3v6.select(event.currentTarget)
            .transition().duration(150)
            .attr("d", d3v6.symbol()
		  .type(v => scales.symbol(v.symbol_var))
		  .size(v => dot_size(v, chart) * settings.hover_size)
		 )
            .style("opacity", d => {
		if (settings.hover_opacity !== null) {
		    return settings.hover_opacity;
		} else {
		    return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
		}
            });
	if (settings.has_url_var) {
            d3v6.select(event.currentTarget)
		.style("cursor", d => d.url_var != "" ? "pointer" : "default");
	}
	if (settings.has_tooltips) {
	    tooltip.style("visibility", "visible")
		    .html(tooltip_content(d, chart));
	}
    });
    selection.on("mousemove", event => {
	if (settings.has_tooltips) {
	    if (settings.tooltip_position_y == "bottom") {
	       tooltip.style("top", (event.pageY+15)+"px")
	    } else if (settings.tooltip_position_y == "top") {
	       var tooltip_height = tooltip.node().getBoundingClientRect().height;
	       tooltip.style("top", (event.pageY - tooltip_height - 10)+"px")
	    }
	    if (settings.tooltip_position_x == "right") {
	       tooltip.style("left", (event.pageX+15)+"px");
	    } else if (settings.tooltip_position_x == "left") {
	       var tooltip_width = tooltip.node().getBoundingClientRect().width;
	       tooltip.style("left", (event.pageX - tooltip_width - 10)+"px");
	    }
	}
    });
    selection.on("mouseout", function(event){
        d3v6.select(event.currentTarget)
            .transition().duration(150)
            .attr("d", d3v6.symbol()
		  .type(d => scales.symbol(d.symbol_var))
		  .size(d => dot_size(d, chart))
		 )
            .style("opacity", function(d) {
		return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
	    });
	if (settings.has_tooltips) {
            tooltip.style("visibility", "hidden");
	}
    });
    selection.on("click", function(event, d, i) {
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
		.attr("transform", d => translation(d, chart.scales()))
    	// fill color
        .style("fill", d => chart.scales().color(d.col_var))
		.style("opacity", d => d.opacity_var !== undefined ? chart.scales().opacity(d.opacity_var) : chart.settings().point_opacity)
    	// symbol and size
        .attr("d", d3v6.symbol()
	      	.type(d => chart.scales().symbol(d.symbol_var))
	      	.size(d => dot_size(d, chart))
	     )
        .attr("class", (d, i) => "dot symbol symbol-c" + css_clean(d.symbol_var) + " color color-c" + css_clean(d.col_var));
}
