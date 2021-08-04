import * as d3 from "d3";
import * as utils from "./utils";

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


// Initial arrow attributes
function init(selection, chart) {
    // tooltips when hovering points
    if (chart.settings().has_tooltips) {
        var tooltip = d3.select(".scatterD3-tooltip");
        selection.on("mouseover", (event, d, i) => {
            tooltip.style("visibility", "visible")
                .html(utils.tooltip_content(d, chart));
        });
        selection.on("mousemove", event => {
            tooltip.style("top", (event.pageY+15)+"px").style("left",(d3.event.pageX+15)+"px");
        });
        selection.on("mouseout", event => {
            tooltip.style("visibility", "hidden");
        });
    }
}

// Apply format to arrow
function format(selection, chart) {
    var sel = selection
        .call(draw, chart)
        .style("stroke-width", "1px")
    // stroke color
        .style("stroke", d => chart.scales().color(d.col_var))
        .attr("marker-end", d => "url(#arrow-head-" + chart.settings().html_id + "-" + chart.scales().color(d.col_var) + ")")
        .attr("class", d => "arrow color color-c" + utils.css_clean(d.col_var))
        .style("opacity", function(d) {
	    return d.opacity_var !== undefined ? chart.scales().opacity(d.opacity_var) : chart.settings().point_opacity;
	});
    return sel;
}

export function create(chart) {
    if (!chart.settings().col_continuous) add_arrows_defs(chart);
    var arrows = chart.svg().select(".chart-body")
        .selectAll(".arrow")
        .data(chart.data().filter(arrow_filter), utils.key);

    arrows.enter()
        .append("svg:line")
        .call(init, chart)
        .call(format, chart);
}


export function update(chart) {
    var arrows = chart.svg().select(".chart-body")
        .selectAll(".arrow")
        .data(chart.data().filter(arrow_filter), utils.key);

    arrows.enter()
        .append("svg:line").call(init, chart)
        .style("opacity", "0")
        .merge(arrows)
        .transition().duration(1000)
        .call(format, chart)
        .style("opacity", "1");

    arrows.exit()
        .transition().duration(1000)
        .style("opacity", "0")
        .remove();
}


// Arrow drawing function
export function draw(selection, chart) {
    selection
        .attr("x1", d => chart.scales().x(0))
        .attr("y1", d => chart.scales().y(0))
        .attr("x2", d => chart.scales().x(d.x))
        .attr("y2", d => chart.scales().y(d.y));
}


