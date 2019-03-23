// Zero horizontal and vertical lines
var draw_line = d3v5.line()
	.x(function (d) { return d.x; })
	.y(function (d) { return d.y; });



function lines_create(chart) {

	if (chart.settings().lines !== null) {
		var lines = chart.svg().select(".chart-body")
			.selectAll(".lines")
			.data(HTMLWidgets.dataframeToD3(chart.settings().lines));

		lines.enter()
			.append("path")
			.call(line_init)
			.call(line_formatting, chart);
	}
}

function lines_update(chart) {

	if (chart.settings().lines !== null) {
		var lines = chart.svg().select(".chart-body")
			.selectAll(".line")
			.data(HTMLWidgets.dataframeToD3(chart.settings().lines));

		lines.enter().append("path").call(line_init)
			.style("opacity", "0")
			.merge(lines)
			.transition().duration(1000)
			.call(line_formatting, chart)
			.style("opacity", "1");

		lines.exit()
			.transition().duration(1000)
			.style("opacity", "0")
			.remove();
	}
}

function line_init(selection) {
	selection
		.attr("class", "line");

	return selection;
}

function line_formatting(selection, chart) {

	var settings = chart.settings();
	var scales = chart.scales();
	var dims = chart.dims();

	selection
		.attr("d", function (d) {
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
		.style("stroke-width", function (d) {
			return d.stroke_width !== undefined && d.stroke_width !== null ? d.stroke_width : "1px";
		})
		.style("stroke", function (d) {
			return d.stroke !== undefined && d.stroke !== null ? d.stroke : "#000000";
		})
		.style("stroke-dasharray", function (d) {
			return d.stroke_dasharray !== undefined && d.stroke_dasharray !== null ? d.stroke_dasharray : null;
		});

	return selection;
}
