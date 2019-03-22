function scatterD3() {

	var width = 600, // default width
		height = 600, // default height
		dims = {},
		settings = {},
		scales = {},
		data = [],
		svg,
		zoom, drag,
		dragging = false;


	function chart(selection) {

		selection.each(function () {

			dims = setup_dims(chart);
			scales = setup_scales(chart);

			// Root chart element and axes
			var root = svg.append("g")
				.attr("class", "root")
				.attr("transform", "translate(" + dims.margins.left + "," + dims.margins.top + ")");

			var viewport = root.append("rect")
				.attr("class", "viewport")
				.style("fill", "#FFF")
				.attr("width", dims.width)
				.attr("height", dims.height);

			// Workaround for RStudio/Safari mousewheel event
			// We manually trigger a wheel event, copying needed arguments
			root.node().addEventListener("mousewheel", function (e) {
				// Create the event
				var ev = document.createEvent("Event");
				ev.initEvent("wheel", true, true);
				ev.deltaY = -e.wheelDeltaY;
				ev.deltaX = 0;
				ev.deltaMode = 0;
				ev.pageX = e.pageX;
				ev.pageY = e.pageY;
				ev.clientX = e.clientX;
				ev.clientY = e.clientY;
				ev.screenX = e.screenX;
				ev.screenY = e.screenY;
				ev.offsetX = e.offsetX;
				ev.offsetY = e.offsetY;
				// Dispatch/Trigger/Fire the event
				this.dispatchEvent(ev);
			});

			root.call(add_axes, chart);

			// chart body
			var chart_body = root.append("svg")
				.attr("class", "chart-body")
				.attr("width", dims.width)
				.attr("height", dims.height);

			// lines
			if (settings.lines !== null) {
				var lines = chart_body
					.selectAll(".lines")
					.data(HTMLWidgets.dataframeToD3(settings.lines));
				lines.enter()
					.append("path")
					.call(line_init)
					.call(line_formatting, chart);
			}


			// Unit circle
			if (settings.unit_circle) {
				var unit_circle = chart_body.append('svg:ellipse')
					.attr('class', 'unit-circle')
					.call(add_unit_circle, chart);
			}

			// Add points
			var dot = chart_body
				.selectAll(".dot")
				.data(data.filter(point_filter), key);
			dot.enter()
				.append("path")
				.call(dot_init, chart)
				.call(dot_formatting, chart);
			// Add arrows
			if (!settings.col_continuous) add_arrows_defs(chart);
			var arrow = chart_body
				.selectAll(".arrow")
				.data(data.filter(arrow_filter), key);
			arrow.enter()
				.append("svg:line")
				.call(arrow_init, chart)
				.call(arrow_formatting, chart);

			// Add ellipses
			if (settings.ellipses) {
				var ellipse = chart_body
					.selectAll(".ellipse")
					.data(settings.ellipses_data);
				ellipse.enter()
					.append("svg:path")
					.call(ellipse_init)
					.call(ellipse_formatting, chart);
			}

			// Add text labels
			if (settings.has_labels) {
				var labels = chart_body.selectAll(".point-label")
					.data(data, key);

				var labels_elements = labels.enter()
					.append("text")
					.call(label_init)
					.call(function (sel) { label_formatting(sel, settings, scales); })
					.call(drag_behavior(chart));
			}
			// Automatic label placement
			if (settings.labels_positions == "auto") {
				// Compute position
				var label_array = labels_placement(labels_elements, settings, scales, dims);
				// Update labels data with new position
				data.forEach(function(d, i) {
					d.lab_dx = label_array[i].x - scales.x(d.x);
					d.lab_dy = label_array[i].y - scales.y(d.y);
				})
				// Redraw
				labels_elements
					.data(data, key)
					.attr("text-anchor", "start")
					.call(function (sel) { label_formatting(sel, settings, scales); });
			}


			// Legends
			var legend = svg.append("g").attr("class", "legend")
				.style("font-size", settings.legend_font_size);

			if (settings.has_legend && settings.legend_width > 0) {
				dims = setup_legend_dims(chart);
				// Color legend
				if (settings.has_color_var)
					add_color_legend(chart, 0);
				// Symbol legend
				if (settings.has_symbol_var)
					add_symbol_legend(chart, 0);
				// Size legend
				if (settings.has_size_var)
					add_size_legend(chart, 0);
			}

			// Tools menu
			if (settings.menu) add_menu(chart);
			// Caption
			if (settings.caption) add_caption(chart);

			// Zoom init
			zoom = zoom_behavior(chart);
			root.call(zoom);
			if (settings.disable_wheel) {
				root.on("wheel.zoom", null)
			}
			// Zoom on
			if (settings.zoom_on !== null) {
				var curZoom = d3v5.zoomTransform(root.node());

				var zoom_dx = (dims.width / 2 - scales.x(settings.zoom_on[0])) / curZoom.k;
				var zoom_dy = (dims.height / 2 - scales.y(settings.zoom_on[1])) / curZoom.k;
				root.transition()
					.duration(0)
					.call(zoom.translateBy, zoom_dx, zoom_dy)
					.on("end", function () {
						if (settings.zoom_on_level != curZoom.k) {
							root.call(zoom.scaleTo, settings.zoom_on_level)
						}
					})					
			}

		});
	}


	// Update chart with transitions
	function update_settings(old_settings) {
		var chart_body = svg.select(".chart-body");
		if (old_settings.labels_size != settings.labels_size)
			svg.selectAll(".point-label").transition().style("font-size", settings.labels_size + "px");
		if (old_settings.point_size != settings.point_size ||
			old_settings.point_opacity != settings.point_opacity) {
			svg.selectAll(".dot").transition()
				.call(dot_formatting, chart);
		}
		if (old_settings.has_labels != settings.has_labels) {
			if (!settings.has_labels) {
				svg.selectAll(".point-label").remove();
			}
			if (settings.has_labels) {
				var labels = chart_body.selectAll(".point-label")
					.data(data, key);
				labels.enter()
					.append("text")
					.call(label_init)
					.call(function (sel) { label_formatting(sel, settings, scales); })
					.call(drag_behavior(chart));
			}
		}
		if (old_settings.unit_circle != settings.unit_circle) {
			if (!settings.unit_circle) {
				var circle = svg.select(".unit-circle");
				circle.transition().duration(1000)
					.call(add_unit_circle, chart)
					.style("opacity", "0").remove();
			}
			if (settings.unit_circle) {
				chart_body.append('svg:ellipse')
					.attr('class', 'unit-circle')
					.style("opacity", "0");
			}
		}
		if (settings.menu) {
			var menu_parent = d3v5.select(svg.node().parentNode);
			menu_parent.style("position", "relative");
			var menu = menu_parent.select(".scatterD3-menu");
			menu.attr("id", "scatterD3-menu-" + settings.html_id);
		}

		// Zoom on
		if (settings.zoom_on !== null) {
			var root = svg.select(".root");
			var curZoom = d3v5.zoomTransform(root.node());

			var zoom_dx = (dims.width / 2 - scales.x(settings.zoom_on[0])) / curZoom.k;
			var zoom_dy = (dims.height / 2 - scales.y(settings.zoom_on[1])) / curZoom.k;
			root.transition()
				.duration(1000)
				.call(zoom.translateBy, zoom_dx, zoom_dy)
				.on("end", function () {
					if (settings.zoom_on_level != curZoom.k) {
						root.transition()
							.duration(1000)
							.call(zoom.scaleTo, settings.zoom_on_level)
					}
				})
		};
		if (settings.zoom_on === null && old_settings.zoom_on !== null) {
			reset_zoom(chart);
		}
	};

	// Update data with transitions
	function update_data() {

		dims = setup_dims(chart);
		scales = setup_scales(chart);

		// Change axes labels
		svg.select(".x-axis-label").text(settings.xlab);
		svg.select(".y-axis-label").text(settings.ylab);

		var t0 = svg.transition().duration(1000);
		t0.call(resize_plot);

		var chart_body = svg.select(".chart-body");
		// Add lines
		if (settings.lines !== null) {
			var line = chart_body.selectAll(".line")
				.data(HTMLWidgets.dataframeToD3(settings.lines));
			line.enter().append("path").call(line_init)
				.style("opacity", "0")
				.merge(line)
				.transition().duration(1000)
				.call(line_formatting, chart)
				.style("opacity", "1");
			line.exit().transition().duration(1000).style("opacity", "0").remove();
		}

		// Unit circle
		if (settings.unit_circle) {
			t0.select(".unit-circle")
				.call(add_unit_circle, chart);
		}

		// Add points
		var dot = chart_body.selectAll(".dot")
			.data(data.filter(point_filter), key);
		dot.enter().append("path").call(dot_init, chart)
			.merge(dot).call(dot_init, chart).transition().duration(1000).call(dot_formatting, chart);
		dot.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();
		// Add arrows
		var arrow = chart_body.selectAll(".arrow")
			.data(data.filter(arrow_filter), key);
		arrow.enter().append("svg:line").call(function (sel) { arrow_init(sel, settings); })
			.style("opacity", "0")
			.merge(arrow)
			.transition().duration(1000)
			.call(function (sel) { arrow_formatting(sel, settings, scales); })
			.style("opacity", "1");
		arrow.exit().transition().duration(1000).style("opacity", "0").remove();

		// Add ellipses
		if (settings.ellipses || settings.ellipses_changed) {
			var ellipse = chart_body.selectAll(".ellipse")
				.data(settings.ellipses_data);
			ellipse.enter().append("path").call(ellipse_init)
				.style("opacity", "0")
				.merge(ellipse)
				.transition().duration(1000)
				.call(ellipse_formatting, chart)
				.style("opacity", "1");
			ellipse.exit().transition().duration(1000).style("opacity", "0").remove();
		}

		if (settings.has_labels) {
			var labels = chart_body.selectAll(".point-label")
				.data(data, key);
			labels.enter().append("text").call(label_init).call(drag_behavior(chart))
				.merge(labels).transition().duration(1000).call(function (sel) { label_formatting(sel, settings, scales); });
			labels.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();
		}

		if (settings.has_labels_changed) {
			var label_export = d3v5.select("#scatterD3-menu-" + settings.html_id)
				.select(".label-export");
			label_export.style("display", settings.has_labels ? "block" : "none");
		}

		if (settings.legend_changed) {
			var legend = svg.select(".legend");
			dims = setup_legend_dims(chart);

			// Move color legend
			if (settings.has_color_var && settings.had_color_var && !settings.col_changed) {
				legend.call(move_color_legend, chart, 1000);
			}
			// Replace color legend
			if (settings.has_color_var && settings.had_color_var && settings.col_changed) {
				legend.call(function (sel) {
					remove_color_legend(sel);
					add_color_legend(chart, 1000);
				});
			}
			// Add color legend
			if (settings.has_color_var && !settings.had_color_var) {
				add_color_legend(chart, 1000);
			}
			// Remove color legend
			if (!settings.has_color_var && settings.had_color_var) {
				legend.call(remove_color_legend);
			}

			// Move symbol legend
			if (settings.has_symbol_var && settings.had_symbol_var && !settings.symbol_changed) {
				legend.call(move_symbol_legend, chart, 1000);
			}
			// Replace symbol legend
			if (settings.has_symbol_var && settings.had_symbol_var && settings.symbol_changed) {
				legend.call(function (sel) {
					remove_symbol_legend(sel);
					add_symbol_legend(chart, 1000);
				});
			}
			// Add symbol legend
			if (settings.has_symbol_var && !settings.had_symbol_var) {
				add_symbol_legend(chart, 1000);
			}
			// Remove symbol legend
			if (!settings.has_symbol_var && settings.had_symbol_var) {
				legend.call(remove_symbol_legend);
			}

			// Move size legend
			if (settings.has_size_var && settings.had_size_var && !settings.size_changed) {
				legend.call(move_size_legend, chart, 1000);
			}
			// Replace size legend
			if (settings.has_size_var && settings.had_size_var && settings.size_changed) {
				legend.call(function (sel) {
					remove_size_legend(sel);
					add_size_legend(chart, 1000);
				});
			}
			// Add size legend
			if (settings.has_size_var && !settings.had_size_var) {
				add_size_legend(chart, 1000);
			}
			// Remove size legend
			if (!settings.has_size_var && settings.had_size_var) {
				legend.call(remove_size_legend);
			}

		}

		reset_zoom(chart);
		lasso_off(chart);
	};

	// Dynamically resize plot area
	function resize_plot(selection) {
		// Change svg attributes
		selection.selectAll(".root")
			.attr("width", dims.width)
			.attr("height", dims.height);
		selection.selectAll(".root")
			.select("rect")
			.attr("width", dims.width)
			.attr("height", dims.height);
		selection.selectAll(".chart-body")
			.attr("width", dims.width)
			.attr("height", dims.height);
		selection.select(".x.axis")
			.attr("transform", "translate(0," + dims.height + ")");
		selection.select(".x-axis-label")
			.attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")");
		selection.select(".x.axis").call(scales.xAxis);
		selection.select(".y.axis").call(scales.yAxis);

		if (settings.unit_circle) {
			selection.select(".unit-circle")
				.call(add_unit_circle, chart);
		}

		var root = selection.select(".root");
		zoom = zoom_behavior(chart);
		root.call(zoom.transform,
			d3v5.zoomTransform(svg.select(".root").node()));

	}

	// Dynamically resize chart elements
	function resize_chart() {
		// recompute dims
		dims = setup_dims(chart);
		dims = setup_legend_dims(chart);
		// recompute x and y scales
		scales.x.range([0, dims.width]);
		scales.x_orig.range([0, dims.width]);
		scales.y.range([dims.height, 0]);
		scales.y_orig.range([dims.height, 0]);
		scales.xAxis = d3v5.axisBottom(scales.x).tickSize(-dims.height);
		scales.yAxis = d3v5.axisLeft(scales.y).tickSize(-dims.width);

		svg.call(resize_plot);

		// svg.select(".root")
		// 	.call(zoom.transform,
		// 		d3v5.zoomTransform(svg.select(".root").node()));

		// Move legends
		if (settings.has_legend && settings.legend_width > 0) {
			var legend = svg.select(".legend");
			if (settings.has_color_var)
				move_color_legend(legend, chart, 0);
			if (settings.has_symbol_var)
				move_symbol_legend(legend, chart, 0);
			if (settings.has_size_var)
				move_size_legend(legend, chart, 0);
		}
		// Move menu
		if (settings.menu) {
			svg.select(".gear-menu")
				.attr("transform", "translate(" + (width - 40) + "," + 10 + ")");
		}
		// Move caption icon and div
		if (settings.caption) {
			var caption_top_margin = settings.menu ? 35 : 10;
			svg.select(".caption-icon")
				.attr("transform", "translate(" + (dims.svg_width - 40) + "," + caption_top_margin + ")");
			d3v5.select(svg.node().parentNode)
				.select(".scatterD3-caption")
				.style("top", dims.svg_height + "px");
		}


	};


	// Add controls handlers for shiny
	chart.add_controls_handlers = function () {
		// Zoom reset
		d3v5.select("#" + settings.dom_id_reset_zoom)
			.on("click", function() { reset_zoom(chart) });

		// SVG export
		d3v5.select("#" + settings.dom_id_svg_export)
			.on("click", function () { export_svg(this, chart); });

		// Lasso toggle
		d3v5.select("#" + settings.dom_id_lasso_toggle)
			.on("click", lasso_toggle, chart);
	};

	chart.add_global_listeners = function () {
		// Toogle zoom and lasso behaviors when shift is pressed
		var parent = d3v5.select("#scatterD3-svg-" + settings.html_id).node().parentNode;
		d3v5.select(parent)
			.attr("tabindex", 0)
			.on("keydown", function () {
				var key = d3v5.event.key !== undefined ? d3v5.event.key : d3v5.event.keyIdentifier;
				if (key == "Shift") {
					if (settings.lasso) {
						lasso_on(chart);
					}
				}
			})
			.on("keyup", function () {
				var key = d3v5.event.key !== undefined ? d3v5.event.key : d3v5.event.keyIdentifier;
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
		var svg = d3v5.select(el).append("svg");
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
		var tooltip = d3v5.select(".scatterD3-tooltip");
		if (tooltip.empty()) {
			tooltip = d3v5.select("body")
				.append("div")
				.style("visibility", "hidden")
				.attr("class", "scatterD3-tooltip");
		}

		// Create title and subtitle div
		var caption = d3v5.select(el).select(".scatterD3-caption");
		if (caption.empty()) {
			caption = d3v5.select(el).append("div")
				.attr("class", "scatterD3-caption");
		}

		// Create menu div
		var menu = d3v5.select(el).select(".scatterD3-menu");
		if (menu.empty()) {
			menu = d3v5.select(el).append("ul")
				.attr("class", "scatterD3-menu");
		}

		// Create scatterD3 instance
		var scatter = scatterD3().width(width).height(height).svg(svg);

		return ({
			resize: function (width, height) {

				if (width < 0) width = 0;
				if (height < 0) height = 0;
				// resize root svg element
				var svg = d3v5.select(el).select("svg");
				svg
					.attr("width", width)
					.attr("height", height);
				// resize chart
				scatter.width(width).height(height).svg(svg).resize();
			},

			renderValue: function (obj) {
				// Check if update or redraw
				var first_draw = (Object.keys(scatter.settings()).length === 0);
				var redraw = first_draw || !obj.settings.transitions;
				var svg = d3v5.select(el).select("svg").attr("id", "scatterD3-svg-" + obj.settings.html_id);
				scatter = scatter.svg(svg);

				// convert data to d3 format
				var data = HTMLWidgets.dataframeToD3(obj.data);
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
					scatter = scatter.data(data, redraw);
					obj.settings.redraw = true;
					scatter = scatter.settings(obj.settings, redraw);
					// add controls handlers and global listeners for shiny apps
					scatter.add_controls_handlers();
					scatter.add_global_listeners();
					// draw chart
					d3v5.select(el)
						.call(scatter);
				}
				// Update only
				else {
					// Array equality test
					function array_equal(a1, a2) {
						return a1.length == a2.length && a1.every(function (v, i) { return v === a2[i]; });
					}

					// Check what did change
					obj.settings.has_legend_changed = scatter.settings().has_legend != obj.settings.has_legend;
					obj.settings.has_labels_changed = scatter.settings().has_labels != obj.settings.has_labels;
					obj.settings.size_range_changed = !array_equal(scatter.settings().size_range, obj.settings.size_range);
					obj.settings.ellipses_changed = scatter.settings().ellipses != obj.settings.ellipses;
					obj.settings.colors_changed = scatter.settings().colors != obj.settings.colors;
					obj.settings.x_log_changed = scatter.settings().x_log != obj.settings.x_log;
					obj.settings.y_log_changed = scatter.settings().y_log != obj.settings.y_log;
					obj.settings.xlim_changed = scatter.settings().xlim != obj.settings.xlim;
					obj.settings.ylim_changed = scatter.settings().ylim != obj.settings.ylim;

					obj.settings.had_color_var = scatter.settings().has_color_var;
					obj.settings.had_symbol_var = scatter.settings().has_symbol_var;
					obj.settings.had_size_var = scatter.settings().has_size_var;

					function changed(varname) {
						return obj.settings.hashes[varname] != scatter.settings().hashes[varname];
					};
					obj.settings.x_changed = changed("x");
					obj.settings.y_changed = changed("y");
					obj.settings.lab_changed = changed("lab");
					obj.settings.col_changed = changed("col_var") ||
						obj.settings.colors_changed;
					obj.settings.size_changed = changed("size_var") ||
						obj.settings.size_range_changed;
					obj.settings.symbol_changed = changed("symbol_var");
					obj.settings.legend_changed = obj.settings.col_changed ||
						obj.settings.symbol_changed ||
						obj.settings.size_changed;
					obj.settings.data_changed = obj.settings.x_changed ||
						obj.settings.y_changed ||
						obj.settings.lab_changed ||
						obj.settings.legend_changed ||
						obj.settings.has_labels_changed ||
						changed("ellipses_data") ||
						obj.settings.ellipses_changed ||
						obj.settings.x_log_changed ||
						obj.settings.y_log_changed ||
						obj.settings.xlim_changed ||
						obj.settings.ylim_changed ||
						changed("opacity_var") ||
						changed("lines");

					// Update settings
					scatter = scatter.settings(obj.settings, redraw);
					// Update data only if needed
					if (obj.settings.data_changed) scatter = scatter.data(data, redraw);
				}

			},

			s: scatter
		});
	}
});
