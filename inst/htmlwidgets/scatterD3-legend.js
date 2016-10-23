// Format legend label
function legend_label_formatting (selection) {
    selection
        .style("text-anchor", "beginning")
        .style("fill", "#000")
        .style("font-weight", "bold");
}

// Create color legend
function add_color_legend(svg, dims, settings, scales) {

    var legend = svg.select(".legend")
        .style("font-size", settings.legend_font_size);

    var legend_color_scale = scales.color.copy();
    if (!settings.col_continuous) {
	// Sort legend
	legend_color_scale
	    .domain(legend_color_scale.domain().sort())
	    .range(legend_color_scale.domain().map(function(d) {return scales.color(d);}));
    }
    
    var color_legend = d3.legendColor()
        .shapePadding(3)
        .shape("rect")
        .scale(legend_color_scale);

    if (!settings.col_continuous) {
	color_legend
	    .on("cellover", function(d) {
		d = css_clean(d);
		var nsel = ".color:not(.color-c" + d + "):not(.selected-lasso):not(.not-selected-lasso)";
		var sel = ".color-c" + d + ":not(.selected-lasso):not(.not-selected-lasso)";
		svg.selectAll(nsel)
		    .transition()
		    .style("opacity", 0.2);
		svg.selectAll(sel)
		    .transition()
		    .style("opacity", 1);
	    })
	    .on("cellout", function(d) {
		var sel = ".color:not(.selected-lasso):not(.not-selected-lasso)";
		svg.selectAll(sel)
		    .transition()
		    .style("opacity", function(d2) {
			return(d2.opacity_var === undefined ? settings.point_opacity : scales.opacity(d2.opacity_var));
		    });
		svg.selectAll(".point-label:not(.selected-lasso):not(.not-selected-lasso)")
		    .transition()
		    .style("opacity", 1);
	    });
    } else {
	color_legend.cells(6);
    }

    legend.append("g")
        .append("text")
        .attr("class", "color-legend-label")
        .attr("transform", "translate(" + dims.legend_x + "," + dims.margins.legend_top + ")")
        .text(settings.col_lab)
        .call(legend_label_formatting);

    legend.append("g")
        .attr("class", "color-legend")
        .attr("transform", "translate(" + dims.legend_x + "," + (dims.margins.legend_top + 8) + ")")
        .call(color_legend);

    return dims;
}

// Create symbol legend
function add_symbol_legend(svg, dims, settings, scales) {

    var legend = svg.select(".legend");

    // Sort legend
    var legend_symbol_scale = scales.symbol.copy();
    legend_symbol_scale
	.domain(legend_symbol_scale.domain().sort())
        .range(legend_symbol_scale.domain().map(function(d) {return d3.symbol().type(d3.symbols[scales.symbol(d)])();}));
    
    var symbol_legend = d3.legendSymbol()
        .shapePadding(5)
        .scale(legend_symbol_scale)
        .on("cellover", function(d) {
	    d = css_clean(d);
	    var nsel = ".symbol:not(.symbol-c" + d + "):not(.selected-lasso):not(.not-selected-lasso)";
	    var sel = ".symbol-c" + d + ":not(.selected-lasso):not(.not-selected-lasso)";
	    svg.selectAll(nsel)
		.transition()
		.style("opacity", 0.2);
	    svg.selectAll(sel)
		.transition()
		.style("opacity", 1);
        })
        .on("cellout", function(d) {
	    var sel = ".symbol:not(.selected-lasso):not(.not-selected-lasso)";
	    svg.selectAll(sel)
		.transition()
		.style("opacity", function(d2) {
		    return(d2.opacity_var === undefined ? settings.point_opacity : scales.opacity(d2.opacity_var));
		});
	    svg.selectAll(".point-label:not(.selected-lasso):not(.not-selected-lasso)")
		.transition()
		.style("opacity", 1);
        });

    legend.append("g")
        .append("text")
        .attr("class", "symbol-legend-label")
        .attr("transform", "translate(" + dims.legend_x + "," + dims.margins.symbol_legend_top + ")")
        .text(settings.symbol_lab)
        .call(legend_label_formatting);

    legend.append("g")
        .attr("class", "symbol-legend")
        .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (dims.margins.symbol_legend_top + 14) + ")")
        .call(symbol_legend);

    return dims;
}

// Create size legend
function add_size_legend(svg, dims, settings, scales) {

    var legend = svg.select(".legend");

    var legend_size_scale = scales.size.copy();
    // FIXME : find exact formula
    legend_size_scale.range(scales.size.range().map(function(d) {return Math.sqrt(d)/1.8;}));

    var size_legend = d3.legendSize()
        .shapePadding(3)
        .shape('circle')
        .scale(legend_size_scale);

    legend.append("g")
        .append("text")
        .attr("class", "size-legend-label")
        .attr("transform", "translate(" + dims.legend_x + "," + dims.margins.size_legend_top + ")")
        .text(settings.size_lab)
        .call(legend_label_formatting);

    legend.append("g")
        .attr("class", "size-legend")
        .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (dims.margins.size_legend_top + 14) + ")")
        .call(size_legend);

    return dims;
}


// Move color legend on resize
function move_color_legend (sel, dims) {
    sel.select(".color-legend-label")
	.attr("transform", "translate(" + dims.legend_x + "," + dims.margins.legend_top + ")");
    sel.select(".color-legend")
	.attr("transform", "translate(" + dims.legend_x + "," + (dims.margins.legend_top + 12) + ")");
}

// Move symbol legend on resize
function move_symbol_legend (sel, dims) {
    sel.select(".symbol-legend-label")
	.attr("transform", "translate(" + dims.legend_x + "," + dims.margins.symbol_legend_top + ")");
    sel.select(".symbol-legend")
	.attr("transform", "translate(" + (dims.legend_x + 8) + "," + (dims.margins.symbol_legend_top + 14) + ")");
}

// Move size legend on resize
function move_size_legend (sel, dims) {
    sel.select(".size-legend-label")
	.attr("transform", "translate(" + dims.legend_x + "," + dims.margins.size_legend_top + ")");
    sel.select(".size-legend")
	.attr("transform", "translate(" + (dims.legend_x + 8) + "," + (dims.margins.size_legend_top + 14) + ")");
}
