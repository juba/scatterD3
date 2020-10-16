
function add_arrows_defs(chart) {
    // <defs>
    var defs = chart.svg().append("defs");
    // arrow head markers
    chart.scales().color.range().forEach(d => {
        defs.append("marker")
	    .attr("id", "arrow-head-" + chart.settings().html_id + "-" + d)
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

// Filter arrows data
function arrow_filter(d) {
    return d.type_var !== undefined && d.type_var == "arrow";
}


function arrows_create(chart) {
    if (!chart.settings().col_continuous) add_arrows_defs(chart);
    var arrows = chart.svg().select(".chart-body")
        .selectAll(".arrow")
        .data(chart.data().filter(arrow_filter), key);

    arrows.enter()
        .append("svg:line")
        .call(arrow_init, chart)
        .call(arrow_formatting, chart);
}


function arrows_update(chart) {
    var arrows = chart.svg().select(".chart-body")
        .selectAll(".arrow")
        .data(chart.data().filter(arrow_filter), key);

    arrows.enter()
        .append("svg:line").call(arrow_init, chart)
        .style("opacity", "0")
        .merge(arrows)
        .transition().duration(1000)
        .call(arrow_formatting, chart)
        .style("opacity", "1");

    arrows.exit()
        .transition().duration(1000)
        .style("opacity", "0")
        .remove();
}


// Arrow drawing function
function draw_arrow(selection, chart) {
    selection
        .attr("x1", d => chart.scales().x(0))
        .attr("y1", d => chart.scales().y(0))
        .attr("x2", d => chart.scales().x(d.x))
        .attr("y2", d => chart.scales().y(d.y));
}

// Initial arrow attributes
function arrow_init(selection, chart) {
    // tooltips when hovering points
    if (chart.settings().has_tooltips) {
        var tooltip = d3v6.select(".scatterD3-tooltip");
        selection.on("mouseover", (event, d, i) => {
            tooltip.style("visibility", "visible")
                .html(tooltip_content(d, chart));
        });
        selection.on("mousemove", event => {
            tooltip.style("top", (event.pageY+15)+"px").style("left",(d3v6.event.pageX+15)+"px");
        });
        selection.on("mouseout", event => {
            tooltip.style("visibility", "hidden");
        });
    }
}

// Apply format to arrow
function arrow_formatting(selection, chart) {
    var sel = selection
        .call(draw_arrow, chart)
        .style("stroke-width", "1px")
    // stroke color
        .style("stroke", d => chart.scales().color(d.col_var))
        .attr("marker-end", d => "url(#arrow-head-" + chart.settings().html_id + "-" + chart.scales().color(d.col_var) + ")")
        .attr("class", d => "arrow color color-c" + css_clean(d.col_var))
        .style("opacity", function(d) {
	    return d.opacity_var !== undefined ? chart.scales().opacity(d.opacity_var) : chart.settings().point_opacity;
	});
    return sel;
}

