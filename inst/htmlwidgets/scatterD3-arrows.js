
function add_arrows_defs(svg, settings, scales) {
    // <defs>
    var defs = svg.append("defs");
    // arrow head markers
    scales.color.range().forEach(function(d) {
        defs.append("marker")
	    .attr("id", "arrow-head-" + settings.html_id + "-" + d)
	    .attr("markerWidth", "10")
	    .attr("markerHeight", "10")
	    .attr("refX", "10")
	    .attr("refY", "4")
	    .attr("orient", "auto")
	    .append("path")
	    .attr("d", "M0,0 L0,8 L10,4 L0,0")
	    .style("fill", d);
    });
}


// Arrow drawing function
function draw_arrow(selection, scales) {
    selection
        .attr("x1", function(d) { return scales.x(0); })
        .attr("y1", function(d) { return scales.y(0); })
        .attr("x2", function(d) { return scales.x(d.x); })
        .attr("y2", function(d) { return scales.y(d.y); });
}

// Initial arrow attributes
function arrow_init (selection, settings) {
    // tooltips when hovering points
    if (settings.has_tooltips) {
        var tooltip = d3.select(".scatterD3-tooltip");
        selection.on("mouseover", function(d, i){
            tooltip.style("visibility", "visible")
                .html(tooltip_content(d, settings));
        });
        selection.on("mousemove", function(){
            tooltip.style("top", (d3.event.pageY+15)+"px").style("left",(d3.event.pageX+15)+"px");
        });
        selection.on("mouseout", function(){
            tooltip.style("visibility", "hidden");
        });
    }
}

// Apply format to arrow
function arrow_formatting(selection, settings, scales) {
    var sel = selection
        .call(function(sel) {draw_arrow(sel, scales);})
        .style("stroke-width", "1px")
    // stroke color
        .style("stroke", function(d) { return scales.color(d.col_var); })
        .attr("marker-end", function(d) { return "url(#arrow-head-" + settings.html_id + "-" + scales.color(d.col_var) + ")"; })
        .attr("class", function(d,i) { return "arrow color color-c" + css_clean(d.col_var); })
        .style("opacity", function(d) {
	    return d.opacity_var !== undefined ? scales.opacity(d.opacity_var) : settings.point_opacity;
	});
    return sel;
}

