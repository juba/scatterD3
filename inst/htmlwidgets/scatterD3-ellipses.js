
// Initial ellipse attributes
function ellipse_init(selection) {
    selection
        .style("fill", "none");
}

// Apply format to ellipse
function ellipse_formatting(selection, settings, scales) {

    // Ellipses path function
    var ellipseFunc = d3.line()
        .x(function(d) { return scales.x(d.x); })
        .y(function(d) { return scales.y(d.y); });

    selection
        .attr("d", function(d) {
	    var ell = HTMLWidgets.dataframeToD3(d.data);
	    return (ellipseFunc(ell));
        })
        .style("stroke", function(d) {
	    // Only one ellipse
	    if (d.level == "_scatterD3_all") {
		if (settings.col_continuous) {
		    return(d3.interpolateViridis(0));
		} else {
		    return(scales.color.range()[0]);
		}
	    }
	    return( scales.color(d.level));
        })
        .style("opacity", 1)
        .attr("class", function(d) {
	    return "ellipse color color-c" + css_clean(d.level);
        });
}
