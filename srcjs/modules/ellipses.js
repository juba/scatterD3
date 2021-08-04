import * as d3 from "d3";
import * as utils from "./utils";

export function create(chart) {
    if (chart.settings().ellipses) {
        var ellipses = chart.svg().select(".chart-body")
            .selectAll(".ellipse")
            .data(chart.settings().ellipses_data);

        ellipses.enter()
            .append("svg:path")
            .call(init)
            .call(format, chart);
    }
}


export function update(chart) {
    if (chart.settings().ellipses || chart.settings().ellipses_changed) {
        var ellipses = chart.svg().select(".chart-body")
            .selectAll(".ellipse")
            .data(chart.settings().ellipses_data);

        ellipses.enter()
            .append("path")
            .call(init)
            .style("opacity", "0")
            .merge(ellipses)
            .transition().duration(1000)
            .call(format, chart)
            .style("opacity", "1");

        ellipses.exit()
            .transition().duration(1000)
            .style("opacity", "0")
            .remove();
    }
}


// Initial ellipse attributes
function init(selection) {
    selection
        .style("fill", "none");
}


// Apply format to ellipse
export function format(selection, chart) {

    var scales = chart.scales();

    // Ellipses path function
    var ellipseFunc = d3.line()
        .x(d => scales.x(d.x))
        .y(d => scales.y(d.y));

    selection
        .attr("d", d => {
	    var ell = HTMLWidgets.dataframeToD3(d.data);
	    return (ellipseFunc(ell));
        })
        .style("stroke", d => {
	    // Only one ellipse
	    if (d.level == "_scatterD3_all") {
		if (chart.settings().col_continuous) {
		    return(d3.interpolateViridis(0));
		} else {
		    return(scales.color.range()[0]);
		}
	    }
	    return( scales.color(d.level));
        })
        .style("opacity", 1)
        .attr("class", d => "ellipse color color-c" + utils.css_clean(d.level));
}
