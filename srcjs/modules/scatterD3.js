import * as d3 from "d3";
import * as arrows from "./arrows";
import * as axes from "./axes";
import * as caption from "./caption";
import * as dots from "./dots";
import * as ellipses from "./ellipses";
import * as label_lines from "./label-lines";
import * as labels from "./labels";
import * as lasso from "./lasso";
import * as legends from "./legends";
import * as lines from "./lines";
import * as menu from "./menu";
import * as zoom from "./zoom";
import { setup_dims, setup_legend_dims } from "./dims";
import { setup_scales } from "./scales";
import {export_svg } from "./exports";

export function scatterD3() {

	var width = 600, // default width
		height = 600, // default height
		dims = {},
		settings = {},
		scales = {},
		data = [],
		positions = [],
		svg,
		zoom_state,
		dragging = false;


	function chart(selection) {

		selection.each(function () {

			dims = setup_dims(chart);
			scales = setup_scales(chart);
			// Root chart element and axes
			const root = svg.append("g")
			.attr("class", "root")
			.attr("transform", "translate(" + dims.margins.left + "," + dims.margins.top + ")");
			
			root.append("rect")
			.attr("class", "viewport")
			.style("fill", "#FFF")
			.attr("width", dims.width)
			.attr("height", dims.height);
			
			root.call(axes.add, chart);

			// chart body
			const chart_body = root.append("svg")
				.attr("class", "chart-body")
				.attr("width", dims.width)
				.attr("height", dims.height);

			// Create elements
			lines.create(chart);
			axes.unit_circle_create(chart);
			dots.create(chart);
			arrows.create(chart);
			ellipses.create(chart);
			labels.create(chart, settings.transitions ? 1000 : 0);

			// Legends
			legends.create(chart);

			// Menu and caption
			if (settings.menu) menu.create(chart);
			if (settings.caption) caption.create(chart);

			// Zoom init
			zoom_state = zoom.behavior(chart);
			root.call(zoom_state);
			if (settings.disable_wheel) {
				root.on("wheel.zoom", null)
			}
			// Zoom on
			zoom.on(chart, 0);

		});
	}


	// Update chart settings with transitions
	function update_settings(old_settings) {

		// Change in labels size
		if (old_settings.labels_size != settings.labels_size) {
			svg.selectAll(".point-label")
				.transition().duration(1000)
				.style("font-size", settings.labels_size + "px");
		}
		// Change in point size or opacity
		if (old_settings.point_size != settings.point_size ||
			old_settings.point_opacity != settings.point_opacity) {
			svg.selectAll(".dot")
				.transition().duration(1000)
				.call(dots.format, chart);
		}
		// Caption
		if (old_settings.caption != settings.caption) {
			d3.select(svg.node().parentNode)
				.select(".scatterD3-caption")
				.selectAll("*")
				.remove();
			svg.select(".caption-icon").remove()
			caption.create(chart);
		}

		// Labels
		if (!old_settings.has_labels && settings.has_labels) {
			labels.create(chart, settings);
		}
		// No more labels
		if (old_settings.has_labels && !settings.has_labels) {
			svg.selectAll(".point-label").remove();
			svg.selectAll(".point-label-line").remove();
		}
		// Unit circle
		if (!old_settings.unit_circle && settings.unit_circle) {
			axes.unit_circle_create(chart);
		}
		// No more unit circle
		if (old_settings.unit_circle && !settings.unit_circle) {
			const circle = svg.select(".unit-circle");
			circle.transition().duration(1000)
				.style("opacity", "0").remove();
		}

		// Zoom on
		if (!settings.data_changed) zoom.on(chart, 1000);
		if (settings.zoom_on === null && old_settings.zoom_on !== null) {
			zoom.reset(chart);
		}
	};


	// Update data with transitions
	function update_data() {

		dims = setup_dims(chart);
		dims = setup_legend_dims(chart);
		scales = setup_scales(chart);

		if (settings.has_legend_changed) {
			resize_chart();
		} else {
			zoom.update(chart);
		}

		lasso.off(chart);

		// Change axes labels
		svg.select(".x-axis-label").text(settings.xlab);
		svg.select(".y-axis-label").text(settings.ylab);

		lines.update(chart);
		axes.unit_circle_update(chart);
		dots.update(chart);
		arrows.update(chart);
		ellipses.update(chart);
		labels.update(chart, settings.transitions ? 1000 : 0);
		label_lines.update(chart, settings.transitions ? 1000 : 0);
		legends.update(chart);

	};


	// Resize chart on window resize
	function resize_chart() {

		// recompute dims
		dims = setup_dims(chart);
		dims = setup_legend_dims(chart);
		// recompute x and y scales
		scales.x.range([0, dims.width]);
		scales.x_orig.range([0, dims.width]);
		scales.y.range([dims.height, 0]);
		scales.y_orig.range([dims.height, 0]);
		scales.xAxis = d3.axisBottom(scales.x).tickSize(-dims.height);
		scales.yAxis = d3.axisLeft(scales.y).tickSize(-dims.width);

		svg.select(".root")
			.attr("width", dims.width)
			.attr("height", dims.height);
		svg.select(".viewport")
			.attr("width", dims.width)
			.attr("height", dims.height);
		svg.select(".chart-body")
			.attr("width", dims.width)
			.attr("height", dims.height);
		svg.select(".x.axis")
			.attr("transform", "translate(0," + dims.height + ")");
		svg.select(".x-axis-label")
			.attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")");

		svg.select(".x.axis").call(scales.xAxis);
		svg.select(".y.axis").call(scales.yAxis);

		const root = svg.select(".root");
		zoom_state = zoom.behavior(chart);
		root.call(zoom_state.transform,
			d3.zoomTransform(svg.select(".root").node()));

		legends.move(chart);
		menu.move(chart);
		caption.move(chart);

	};


	// Add controls handlers for shiny
	chart.add_controls_handlers = function () {
		// Zoom reset
		d3.select("#" + settings.dom_id_reset_zoom)
			.on("click", function () { zoom.reset(chart) });

		// SVG export
		d3.select("#" + settings.dom_id_svg_export)
			.on("click", function () { export_svg(this, chart); });

		// Lasso toggle
		d3.select("#" + settings.dom_id_lasso_toggle)
			.on("click", function () { lasso.toggle(chart); });
	};

	chart.add_global_listeners = function () {
		// Toogle zoom and lasso behaviors when shift is pressed
		const parent = d3.select("#scatterD3-svg-" + settings.html_id).node().parentNode;
		d3.select(parent)
			.attr("tabindex", 0)
			.on("keydown", function (event) {
				const key = event.key !== undefined ? event.key : event.keyIdentifier;
				if (key == "Shift") {
					if (settings.lasso) {
						lasso.on(chart);
					}
				}
			})
			.on("keyup", function (event) {
				const key = event.key !== undefined ? event.key : event.keyIdentifier;
				if (key == "Shift") {
					if (settings.lasso) {
						lasso.off(chart);
					}
				}
			});

	};

	// resize
	chart.resize = function () {
		resize_chart();
	};

	// settings getter/setter
	chart.data = function (value, redraw) {
		if (!arguments.length) return data;
		data = value;
		if (!redraw) update_data();
		return chart;
	};

	// settings getter/setter
	chart.settings = function (value, redraw) {
		if (!arguments.length) return settings;
		if (Object.keys(settings).length === 0 || redraw) {
			settings = value;
		} else {
			var old_settings = settings;
			settings = value;
			update_settings(old_settings);
		}
		return chart;
	};

	// labels positions getter/setter
	chart.positions = function (value) {
		if (!arguments.length) return positions;
		positions = value;
		return chart;
	};

	// dragging getter/setter
	chart.dragging = function (value) {
		if (!arguments.length) return dragging;
		dragging = value;
		return chart;
	};

	chart.svg = function (value) {
		if (!arguments.length) return svg;
		svg = value;
		return chart;
	};

	// width getter/setter
	chart.width = function (value) {
		if (!arguments.length) return width;
		width = value;
		return chart;
	};

	// height getter/setter
	chart.height = function (value) {
		if (!arguments.length) return height;
		height = value;
		return chart;
	};

	// dims getter/setter
	chart.dims = function (value) {
		if (!arguments.length) return dims;
		dims = value;
		return dims;
	}

	// scales getter/setter
	chart.scales = function (value) {
		if (!arguments.length) return scales;
		scales = value;
		return scales;
	}

	// zoom getter
	chart.zoom = function () {
		return zoom_state;
	}

	return chart;
}


