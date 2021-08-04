import "widgets";
import * as d3 from "d3";

// Zero horizontal and vertical lines
var draw_line = d3.line()
	.x(d => d.x)
	.y(d => d.y);



export function create(chart) {

	if (chart.settings().lines !== null) {
		var lines = chart.svg().select(".chart-body")
			.selectAll(".lines")
			.data(HTMLWidgets.dataframeToD3(chart.settings().lines));

		lines.enter()
			.append("path")
			.call(init)
			.call(format, chart);
	}
}

export function update(chart) {

	if (chart.settings().lines !== null) {
		var lines = chart.svg().select(".chart-body")
			.selectAll(".line")
			.data(HTMLWidgets.dataframeToD3(chart.settings().lines));

		lines.enter().append("path").call(init)
			.style("opacity", "0")
			.merge(lines)
			.transition().duration(1000)
			.call(format, chart)
			.style("opacity", "1");

		lines.exit()
			.transition().duration(1000)
			.style("opacity", "0")
			.remove();
	}
}

function init(selection) {
	selection
		.attr("class", "line");

	return selection;
}

export function format(selection, chart) {

	var settings = chart.settings();
	var scales = chart.scales();
	var dims = chart.dims();

	selection
		.attr("d", d => {
			// Categorical variables
			if (settings.x_categorical && settings.y_categorical) { return null; };
			if (settings.x_categorical) {
				if (d.slope != 0) { return null; }
				else {
					return draw_line([{ x: 0, y: scales.y(d.intercept) },
					{ x: dims.width, y: scales.y(d.intercept) }]);
				}
			}
			if (settings.y_categorical) {
				if (d.slope !== null) { return null; }
			}
			// Vertical line
			if (d.slope === null) {
				return draw_line([{ x: scales.x(d.intercept), y: 0 },
				{ x: scales.x(d.intercept), y: dims.height }]);
			}
			// All other lines
			else {
				return draw_line([{ x: 0, y: scales.y(d.slope * scales.x.domain()[0] + d.intercept) },
				{ x: dims.width, y: scales.y(d.slope * scales.x.domain()[1] + d.intercept) }]);
			}
		})
		.style("stroke-width", d =>	d.stroke_width !== undefined && d.stroke_width !== null ? d.stroke_width : "1px")
		.style("stroke", d => d.stroke !== undefined && d.stroke !== null ? d.stroke : "#000000")
		.style("stroke-dasharray", d => d.stroke_dasharray !== undefined && d.stroke_dasharray !== null ? d.stroke_dasharray : null);

	return selection;
}
