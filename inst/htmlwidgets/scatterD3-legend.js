// Format legend label
function legend_label_formatting (selection) {
    selection
        .style("text-anchor", "beginning")
        .style("fill", "#000")
        .style("font-weight", "bold");
}


// Create color legend
function add_color_legend(chart, duration) {

    // Default transition duration to 0
    duration = typeof duration !== 'undefined' ? duration : 0;
    var svg = chart.svg();
    var legend = svg.select(".legend");

    var legend_color_scale = chart.scales().color.copy();
    if (!chart.settings().col_continuous) {
        // Sort legend
        if (!chart.settings().col_levels) {
            var col_domain = legend_color_scale.domain().sort();
        } else {
            var col_domain = chart.settings().col_levels;
        }
        legend_color_scale
            .domain(col_domain)
            .range(col_domain.map(function (d) { return chart.scales().color(d); }));
    }

    var color_legend = d3v5.legendColor()
        .shapePadding(3)
        .shape("rect")
        .scale(legend_color_scale);

    if (!chart.settings().col_continuous) {
        color_legend
            .on("cellover", function (d) {
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
            .on("cellout", function (d) {
                var sel = ".color:not(.selected-lasso):not(.not-selected-lasso)";
                svg.selectAll(sel)
                    .transition()
                    .style("opacity", function (d2) {
                        return (d2.opacity_var === undefined ? chart.settings().point_opacity : chart.scales().opacity(d2.opacity_var));
                    });
                svg.selectAll(".point-label:not(.selected-lasso):not(.not-selected-lasso)")
                    .transition()
                    .style("opacity", 1);
            });
    } else {
        color_legend.cells(6);
    }

    legend.append("g")
        .attr("class", "color-legend-label")
        .append("text")
        .text(chart.settings().col_lab)
        .call(legend_label_formatting);

    legend.append("g")
        .attr("class", "color-legend")
        .call(color_legend);

    legend.call(function(legend) { move_color_legend(legend, chart, 0);});

    if (duration != 0) {
	legend.selectAll(".color-legend-label, .color-legend")
	    .style("opacity", 0)
	    .transition().duration(duration)
	    .style("opacity", 1);
    }

}

// Create symbol legend
function add_symbol_legend(chart, duration) {

    // Default transition duration to 0
    duration = typeof duration !== 'undefined' ? duration : 0;
    var svg = chart.svg();
    var legend = svg.select(".legend");

    // Sort legend
    var legend_symbol_scale = chart.scales().symbol.copy();
    if (!chart.settings().symbol_levels) {
        var symbol_domain = legend_symbol_scale.domain().sort();
    } else {
        var symbol_domain = chart.settings().symbol_levels;
    }
    legend_symbol_scale
        .domain(symbol_domain)
        .range(symbol_domain.map(function (d) { return d3v5.symbol().type(chart.scales().symbol(d))();}));

    var symbol_legend = d3v5.legendSymbol()
        .shapePadding(5)
        .scale(legend_symbol_scale)
        .on("cellover", function (d) {
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
        .on("cellout", function (d) {
            var sel = ".symbol:not(.selected-lasso):not(.not-selected-lasso)";
            svg.selectAll(sel)
                .transition()
                .style("opacity", function (d2) {
                    return (d2.opacity_var === undefined ? chart.settings().point_opacity : chart.scales().opacity(d2.opacity_var));
                });
            svg.selectAll(".point-label:not(.selected-lasso):not(.not-selected-lasso)")
                .transition()
                .style("opacity", 1);
        });

    legend.append("g")
        .append("text")
        .attr("class", "symbol-legend-label")
        .text(chart.settings().symbol_lab)
        .call(legend_label_formatting);

    legend.append("g")
        .attr("class", "symbol-legend")
        .call(symbol_legend);

    legend.call(move_symbol_legend, chart, 0);

    if (duration != 0) {
        legend.selectAll(".symbol-legend-label, .symbol-legend")
            .style("opacity", 0)
            .transition().duration(duration)
            .style("opacity", 1);
    }

}

// Create size legend
function add_size_legend(chart, duration) {

    // Default transition duration to 0
    duration = typeof duration !== 'undefined' ? duration : 0;

    var legend = chart.svg().select(".legend");
    var legend_size_scale = chart.scales().size.copy();
    // FIXME : find exact formula
    legend_size_scale.range(chart.scales().size.range().map(function(d) {return Math.sqrt(d)/1.8;}));

    var size_legend = d3v5.legendSize()
        .shapePadding(3)
        .shape('circle')
        .scale(legend_size_scale);

    legend.append("g")
        .append("text")
        .attr("class", "size-legend-label")
        .text(chart.settings().size_lab)
        .call(legend_label_formatting);

    legend.append("g")
        .attr("class", "size-legend")
        .call(size_legend);

    legend.call(move_size_legend, chart, 0);

    if (duration != 0) {
	legend.selectAll(".size-legend-label, .size-legend")
	    .style("opacity", 0)
	    .transition().duration(duration)
	    .style("opacity", 1);
    }


}


// Move color legend on resize
function move_color_legend (legend, chart, duration) {
    var dims = chart.dims();
    legend.select(".color-legend-label")
    	.transition().duration(duration)
	    .attr("transform", "translate(" + dims.legend_x + "," + dims.margins.legend_top + ")");
    legend.select(".color-legend")
    	.transition().duration(duration)
	    .attr("transform", "translate(" + dims.legend_x + "," + (dims.margins.legend_top + 12) + ")");
}

// Move symbol legend on resize
function move_symbol_legend (legend, chart, duration) {
    var dims = chart.dims();
    legend.select(".symbol-legend-label")
    	.transition().duration(duration)
	    .attr("transform", "translate(" + dims.legend_x + "," + dims.margins.symbol_legend_top + ")");
    legend.select(".symbol-legend")
    	.transition().duration(duration)
	    .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (dims.margins.symbol_legend_top + 16) + ")");
}

// Move size legend on resize
function move_size_legend (legend, chart, duration) {
    var dims = chart.dims();
    legend.select(".size-legend-label")
    	.transition().duration(duration)
	    .attr("transform", "translate(" + dims.legend_x + "," + dims.margins.size_legend_top + ")");
    legend.select(".size-legend")
    	.transition().duration(duration)
	    .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (dims.margins.size_legend_top + 14) + ")");
}


// Remove color legend
function remove_color_legend (legend) {
    legend.selectAll(".color-legend-label, .color-legend")
    	.style("opacity", "0")
	    .remove();
}

// Remove symbol legend
function remove_symbol_legend (legend) {
    legend.selectAll(".symbol-legend-label, .symbol-legend")
	    .style("opacity", "0")
	    .remove();
}

// Remove size legend
function remove_size_legend (legend) {
    legend.selectAll(".size-legend-label, .size-legend")
    	.style("opacity", "0")
	    .remove();
}
