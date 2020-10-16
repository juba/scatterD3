function scatterD3() {

	var width = 600, // default width
		height = 600, // default height
		dims = {},
		settings = {},
		scales = {},
		data = [],
		positions = [],
		svg,
		zoom,
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

			root.call(add_axes, chart);

			// chart body
			const chart_body = root.append("svg")
				.attr("class", "chart-body")
				.attr("width", dims.width)
				.attr("height", dims.height);

			// Create elements
			lines_create(chart);
			unit_circle_create(chart);
			dots_create(chart);
			arrows_create(chart);
			ellipses_create(chart);
			labels_create(chart, settings.transitions ? 1000 : 0);

			// Legends
			legends_create(chart);

			// Menu and caption
			if (settings.menu) menu_create(chart);
			if (settings.caption) caption_create(chart);

			// Zoom init
			zoom = zoom_behavior(chart);
			root.call(zoom);
			if (settings.disable_wheel) {
				root.on("wheel.zoom", null)
			}
			// Zoom on
			zoom_on(chart, 0);

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
				.call(dot_formatting, chart);
		}
  	// Caption
		if (old_settings.caption != settings.caption) {
			d3v6.select(svg.node().parentNode)
		     .select(".scatterD3-caption")
		     .selectAll("*")
			 .remove();
			svg.select(".caption-icon").remove()
			caption_create(chart);
		}

		// Labels
		if (!old_settings.has_labels && settings.has_labels) {
			labels_create(chart, settings);
		}
		// No more labels
		if (old_settings.has_labels && !settings.has_labels) {
			svg.selectAll(".point-label").remove();
			svg.selectAll(".point-label-line").remove();
		}
		// Unit circle
		if (!old_settings.unit_circle && settings.unit_circle) {
			unit_circle_create(chart);
		}
		// No more unit circle
		if (old_settings.unit_circle && !settings.unit_circle) {
			const circle = svg.select(".unit-circle");
			circle.transition().duration(1000)
				.style("opacity", "0").remove();
		}

		// Zoom on
		if (!settings.data_changed) zoom_on(chart, 1000);
		if (settings.zoom_on === null && old_settings.zoom_on !== null) {
			reset_zoom(chart);
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
			update_zoom(chart);
		}

		lasso_off(chart);

		// Change axes labels
		svg.select(".x-axis-label").text(settings.xlab);
		svg.select(".y-axis-label").text(settings.ylab);

		lines_update(chart);
		unit_circle_update(chart);
		dots_update(chart);
		arrows_update(chart);
		ellipses_update(chart);
		labels_update(chart, settings.transitions ? 1000 : 0);
		label_lines_update(chart, settings.transitions ? 1000 : 0);
		legends_update(chart);

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
		scales.xAxis = d3v6.axisBottom(scales.x).tickSize(-dims.height);
		scales.yAxis = d3v6.axisLeft(scales.y).tickSize(-dims.width);

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
		zoom = zoom_behavior(chart);
		root.call(zoom.transform,
			d3v6.zoomTransform(svg.select(".root").node()));

		legends_move(chart);
		menu_move(chart);
		caption_move(chart);

	};


	// Add controls handlers for shiny
	chart.add_controls_handlers = function () {
		// Zoom reset
		d3v6.select("#" + settings.dom_id_reset_zoom)
			.on("click", function() { reset_zoom(chart) });

		// SVG export
		d3v6.select("#" + settings.dom_id_svg_export)
			.on("click", function () { export_svg(this, chart); });

		// Lasso toggle
		d3v6.select("#" + settings.dom_id_lasso_toggle)
			.on("click", function() { lasso_toggle(chart); });
	};

	chart.add_global_listeners = function () {
		// Toogle zoom and lasso behaviors when shift is pressed
		const parent = d3v6.select("#scatterD3-svg-" + settings.html_id).node().parentNode;
		d3v6.select(parent)
			.attr("tabindex", 0)
			.on("keydown", function (event) {
				const key = event.key !== undefined ? event.key : event.keyIdentifier;
				if (key == "Shift") {
					if (settings.lasso) {
						lasso_on(chart);
					}
				}
			})
			.on("keyup", function (event) {
				const key = event.key !== undefined ? event.key : event.keyIdentifier;
				if (key == "Shift") {
					if (settings.lasso) {
						lasso_off(chart);
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
	chart.dims = function(value) {
		if (!arguments.length) return dims;
		dims = value;
		return dims;
	}

	// scales getter/setter
	chart.scales = function(value) {
		if (!arguments.length) return scales;
		scales = value;
		return scales;
	}

	// zoom getter
	chart.zoom = function() {
		return zoom;
	}

	return chart;
}



HTMLWidgets.widget({

	name: 'scatterD3',

	type: 'output',

	factory: function (el, width, height) {

		if (width < 0) width = 0;
		if (height < 0) height = 0;
		// Create root svg element
		var svg = d3v6.select(el).append("svg");
		svg
			.attr("width", width)
			.attr("height", height)
			.attr("class", "scatterD3")
			.append("style")
			.text(".scatterD3 {font: 11px Open Sans, Droid Sans, Helvetica, Verdana, sans-serif;}" +
				".scatterD3 .axis line, .axis path { stroke: #000; fill: none; shape-rendering: CrispEdges;} " +
				".scatterD3 .axis .tick line { stroke: #ddd;} " +
				".scatterD3 .axis text { fill: #000; }");

		// Create tooltip content div
		let tooltip = d3v6.select(".scatterD3-tooltip");
		if (tooltip.empty()) {
			tooltip = d3v6.select("body")
				.append("div")
				.style("visibility", "hidden")
				.attr("class", "scatterD3-tooltip");
		}

		// Create title and subtitle div
		let caption = d3v6.select(el).select(".scatterD3-caption");
		if (caption.empty()) {
			caption = d3v6.select(el).append("div")
				.attr("class", "scatterD3-caption");
		}

		// Create menu div
		let menu = d3v6.select(el).select(".scatterD3-menu");
		if (menu.empty()) {
			menu = d3v6.select(el).append("ul")
				.attr("class", "scatterD3-menu");
		}

		// Create scatterD3 instance
		let scatter = scatterD3().width(width).height(height).svg(svg);

		return ({
			resize: function (width, height) {

				if (width < 0) width = 0;
				if (height < 0) height = 0;
				// resize root svg element
				const svg = d3v6.select(el).select("svg");
				svg
					.attr("width", width)
					.attr("height", height);
				// resize chart
				scatter.width(width).height(height).svg(svg).resize();
			},

			renderValue: function (obj) {
				// Check if update or redraw
				const first_draw = (Object.keys(scatter.settings()).length === 0);
				const redraw = first_draw || !obj.settings.transitions;
				const svg = d3v6.select(el).select("svg")
				const menu = d3v6.select(el).select(".scatterD3-menu");
				// Set or update html_id for svg and menu
				svg.attr("id", "scatterD3-svg-" + obj.settings.html_id);
				menu.attr("id", "scatterD3-menu-" + obj.settings.html_id);

				scatter = scatter.svg(svg);

				// convert data to d3 format
				const data = HTMLWidgets.dataframeToD3(obj.data);
				if (obj.settings.labels_positions) {
					if (obj.settings.labels_positions != "auto") {
						obj.settings.labels_positions = HTMLWidgets.dataframeToD3(obj.settings.labels_positions);
					}
				}

				// If no transitions, remove chart and redraw it
				if (!obj.settings.transitions) {
					svg.selectAll("*:not(style)").remove();
					menu.selectAll("li").remove();
					caption.selectAll("*").remove();
				}

				// Complete draw
				if (redraw) {
					data.label_lines = new Array();
					scatter = scatter.data(data, redraw);
					obj.settings.redraw = true;
					// Create array to hold manual (drag) or automatic label positions
					scatter = scatter.positions(new Array(data.length));
					scatter = scatter.settings(obj.settings, redraw);
					// add controls handlers and global listeners for shiny apps
					scatter.add_controls_handlers();
					scatter.add_global_listeners();
					// draw chart
					d3v6.select(el)
						.call(scatter);
				}
				// Update only
				else {
					// Array equality test
					function array_equal(a1, a2) {
						return a1.length == a2.length && a1.every((v, i) => v === a2[i]);
					}
					function object_equal(x, y) {
					  const ok = Object.keys, tx = typeof x, ty = typeof y;
            return x && y && tx === 'object' && tx === ty ? (
              ok(x).length === ok(y).length &&
              ok(x).every(key => deepEqual(x[key], y[key]))
            ) : (x === y);
					}

					// Check what did change
					obj.settings.has_legend_changed = scatter.settings().has_legend != obj.settings.has_legend;
					obj.settings.has_labels_changed = scatter.settings().has_labels != obj.settings.has_labels;
					obj.settings.size_range_changed = !array_equal(scatter.settings().size_range, obj.settings.size_range);
					obj.settings.ellipses_changed = scatter.settings().ellipses != obj.settings.ellipses;

					if (Array.isArray(scatter.settings().colors) && Array.isArray(obj.settings.colors)) {
						obj.settings.colors_changed = !array_equal(scatter.settings().colors, obj.settings.colors);
					} else {
						obj.settings.colors_changed = scatter.settings().colors != obj.settings.colors;
					}
					if (typeof(scatter.settings().sizes) === "object" && typeof(obj.settings.sizes) === "object") {
						obj.settings.sizes_changed = !object_equal(scatter.settings().sizes, obj.settings.sizes);
					} else {
						obj.settings.sizes_changed = scatter.settings().sizes != obj.settings.sizes;
					}
					if (typeof(scatter.settings().opacities) === "object" && typeof(obj.settings.opacities) === "object") {
						obj.settings.opacities_changed = !object_equal(scatter.settings().opacities, obj.settings.opacities);
					} else {
						obj.settings.opacities_changed = scatter.settings().opacities != obj.settings.opacities;
					}

					obj.settings.x_log_changed = scatter.settings().x_log != obj.settings.x_log;
					obj.settings.y_log_changed = scatter.settings().y_log != obj.settings.y_log;
					obj.settings.xlim_changed = scatter.settings().xlim != obj.settings.xlim;
					obj.settings.ylim_changed = scatter.settings().ylim != obj.settings.ylim;
					obj.settings.symbol_lab_changed = scatter.settings().symbol_lab != obj.settings.symbol_lab;

					obj.settings.had_color_var = scatter.settings().has_color_var;
					obj.settings.had_symbol_var = scatter.settings().has_symbol_var;
					obj.settings.had_size_var = scatter.settings().has_size_var;

					let changed = (varname) => (
						obj.settings.hashes[varname] != scatter.settings().hashes[varname]
					);
					obj.settings.x_changed = changed("x");
					obj.settings.y_changed = changed("y");
					obj.settings.lab_changed = changed("lab");
					obj.settings.col_changed = changed("col_var") ||
						obj.settings.colors_changed;
					obj.settings.size_changed = changed("size_var") ||
						obj.settings.size_range_changed ||
						obj.settings.sizes_changed;
					obj.settings.symbol_changed = changed("symbol_var");
					obj.settings.legend_changed = obj.settings.col_changed ||
						obj.settings.symbol_changed ||
						obj.settings.size_changed;

					obj.settings.labels_positions_changed = changed("labels_positions");

					// If labels positions arg has not changed, get old ones
					if (obj.settings.labels_positions_changed) {
						data.label_lines = new Array();
						obj.positions = new Array()
					} else {
						const data_keys = [...new Set(data.map(d => d.key_var))]
						data.label_lines = scatter.data().label_lines
						// remove label lines if label not here anymore
						data.label_lines = data.label_lines.filter(d => (data_keys.includes(d.key_var)));
						// Update label lines data with new x and y data
						data.label_lines = data.label_lines.map(d => {
							const key = d.key_var
							const cur_data = data.filter(d => (d.key_var == key))[0]
							d.x = cur_data.x
							d.y = cur_data.y
							d.col_var = cur_data.col_var
							d.symbol_var = cur_data.symbol_var
							return d
						})
						obj.positions = scatter.positions();
						obj.positions = obj.positions.filter(d => (data_keys.includes(d.key_var)));

					}


					obj.settings.data_changed = obj.settings.x_changed ||
						obj.settings.y_changed ||
						obj.settings.lab_changed ||
						obj.settings.legend_changed ||
						obj.settings.has_labels_changed ||
						obj.settings.labels_positions_changed ||
						changed("ellipses_data") ||
						obj.settings.ellipses_changed ||
						obj.settings.x_log_changed ||
						obj.settings.y_log_changed ||
						obj.settings.xlim_changed ||
						obj.settings.ylim_changed ||
						changed("opacity_var") ||
						obj.settings.opacities_changed ||
						changed("lines");

					obj.settings.positions_changed =
						obj.settings.has_labels_changed ||
						obj.settings.labels_positions_changed;

					// Update settings and positions
					scatter = scatter.settings(obj.settings, redraw);
					scatter = scatter.positions(obj.positions);
					// Update data only if needed
					if (obj.settings.data_changed) scatter = scatter.data(data, redraw);
				}

				if (typeof(obj.settings.init_callback) === "function") {
					obj.settings.init_callback.call(scatter);
				}

			},

			s: scatter
		});
	}
});
