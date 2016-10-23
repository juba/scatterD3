function scatterD3() {

    var width = 600, // default width
	height = 600, // default height
	dims = {},
	settings = {},
	scales = {},
	data = [],
	svg,
	draw_line, zoom, drag;
    
    // Key function to identify rows when interactively filtering
    function key(d) {
        return d.key_var;
    }

    // Default translation function for points and labels
    function translation(d) {
        return "translate(" + scales.x(d.x) + "," + scales.y(d.y) + ")";
    }

    // Zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0, 32])
        .on("zoom", zoomed);
    
    // Zoom function
    function zoomed(reset) {
	var root = svg.select(".root");
	if (!settings.x_categorical) {
            scales.x = d3.event.transform.rescaleX(scales.x_orig);
            scales.xAxis = scales.xAxis.scale(scales.x);
            root.select(".x.axis").call(scales.xAxis);
	}
	if (!settings.y_categorical) {
            scales.y = d3.event.transform.rescaleY(scales.y_orig);
            scales.yAxis = scales.yAxis.scale(scales.y);
            root.select(".y.axis").call(scales.yAxis);
	}
	var chart_body = svg.select(".chart-body");
        chart_body.selectAll(".dot, .point-label")
            .attr("transform", translation);
	chart_body.selectAll(".line").call(line_formatting);
        chart_body.selectAll(".arrow").call(draw_arrow);
        chart_body.selectAll(".ellipse").call(ellipse_formatting);
        svg.select(".unit-circle").call(unit_circle_init);
        if (typeof settings.zoom_callback === 'function') {
		      settings.zoom_callback(x.domain()[0], x.domain()[1], y.domain()[0], y.domain()[1]);
		    }
    }

    // Reset zoom function
    function reset_zoom() {
	var root = svg.select(".root");
        root.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }

    // Export to SVG function
    function export_svg() {
        var svg_content = svg
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", 1.1)
            .node().parentNode.innerHTML;
        // Dirty dirty dirty...
        var tmp = svg_content.replace(/<g class="gear-menu[\s\S]*?<\/g>/, '');
        var svg_content2 = tmp.replace(/<ul class="scatterD3-menu[\s\S]*?<\/ul>/, '');
        var image_data = "data:image/octet-stream;base64," + window.btoa(svg_content2);
        d3.select(this)
            .attr("download", settings.html_id + ".svg")
            .attr("href", image_data);
    }

    // Function to export custom labels position to CSV file
    function export_labels_position() {
	var lines_data = ["scatterD3_label,scatterD3_label_x,scatterD3_label_y"];
	data.forEach(function(d, index){
            var labx = d.x;
            if (d.lab_dx !== undefined) {
		labx = d.x + scales.x.invert(d.lab_dx) - scales.x.domain()[0];
            }
            var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
            var offset_y = (-Math.sqrt(size) / 2) - 6;
            if (d.lab_dy !== undefined) {
		offset_y = d.lab_dy;
            }
            var laby = d.y + scales.y.invert(offset_y) - scales.y.domain()[1];
            var this_line = d.lab + "," + labx + "," + laby;
            lines_data.push(this_line);
	});
	var csv_content = "data:text/csv;base64," + btoa(lines_data.join("\n"));
	d3.select(this)
            .attr("download", settings.html_id + "_labels.csv")
            .attr("href", encodeURI(csv_content));
    }

    // Create and draw x and y axes
    function add_axes(selection) {

        // x axis
        selection.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + dims.height + ")")
            .style("font-size", settings.axes_font_size)
            .call(scales.xAxis);

        selection.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")")
            .style("text-anchor", "end")
            .style("font-size", settings.axes_font_size)
            .text(settings.xlab);

        // y axis
        selection.append("g")
            .attr("class", "y axis")
            .style("font-size", settings.axes_font_size)
            .call(scales.yAxis);

        selection.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "translate(5,6) rotate(-90)")
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(settings.ylab);

    }

    // Zero horizontal and vertical lines
    draw_line = d3.line()
	.x(function(d) {return d.x;})
	.y(function(d) {return d.y;});

    // Create tooltip content function
    function tooltip_content(d) {
        // no tooltips
        if (!settings.has_tooltips) return null;
        if (settings.has_custom_tooltips) {
            // custom tooltipsl
            return d.tooltip_text;
        } else {
            // default tooltips
            var text = Array();
            if (settings.has_labels) text.push("<b>"+d.lab+"</b>");
	    var x_value = settings.x_categorical ? d.x : d.x.toFixed(3);
	    var y_value = settings.y_categorical ? d.y : d.y.toFixed(3);
            text.push("<b>"+settings.xlab+":</b> "+ x_value);
            text.push("<b>"+settings.ylab+":</b> "+ y_value);
            if (settings.has_color_var) text.push("<b>"+settings.col_lab+":</b> "+d.col_var);
            if (settings.has_symbol_var) text.push("<b>"+settings.symbol_lab+":</b> "+d.symbol_var);
            if (settings.has_size_var) text.push("<b>"+settings.size_lab+":</b> "+d.size_var);
            if (settings.has_opacity_var) text.push("<b>"+settings.opacity_lab+":</b> "+d.opacity_var);
            return text.join("<br />");
        }
    }

    function line_init(selection) {
	selection
	    .attr("class", "line");
    }

    function line_formatting(selection) {
	selection
	    .attr("d", function(d) {
		// Categorical variables
		if (settings.x_categorical && settings.y_categorical) { return null; };
		if (settings.x_categorical) {
		    if (d.slope != 0) { return null; }
		    else {
			return draw_line([{x:0, y: scales.y(d.intercept)},
					  {x:dims.width, y: scales.y(d.intercept)}]);
		    }
		}
		if (settings.y_categorical) {
		    if (d.slope !== null) { return null; }
		}
		// Vertical line
		if (d.slope === null) {
		    return draw_line([{x:scales.x(d.intercept), y: 0},
				      {x:scales.x(d.intercept), y: dims.height}]);
		}
		// All other lines
		else {
		    return draw_line([{x:0, y: scales.y(d.slope * scales.x.domain()[0] + d.intercept)},
				      {x:dims.width, y: scales.y(d.slope * scales.x.domain()[1] + d.intercept)}]);
		}
	    })
	    .style("stroke-width", function(d) {
		return d.stroke_width !== undefined && d.stroke_width !== null ? d.stroke_width : "1px";
	    })
	    .style("stroke", function(d) {
		return d.stroke !== undefined && d.stroke !== null ? d.stroke : "#000000";
	    })
	    .style("stroke-dasharray", function(d) {
		return d.stroke_dasharray !== undefined && d.stroke_dasharray !== null ? d.stroke_dasharray : null;
	    });

    }

    // Returns dot size from associated data
    function dot_size(data) {
        var size = settings.point_size;
        if (settings.has_size_var) { size = scales.size(data.size_var); }
        return(size);
    }

    // Initial dot attributes
    function dot_init (selection) {
        // tooltips when hovering points
        var tooltip = d3.select(".scatterD3-tooltip");
        selection.on("mouseover", function(d, i){
            d3.select(this)
                .transition().duration(150)
                .attr("d", d3.symbol()
		      .type(function(d) { return d3.symbols[scales.symbol(d.symbol_var)]; })
		      .size(function(d) { return (dot_size(d) * settings.hover_size); })
		     )
                .style("opacity", function(d) {
		    if (settings.hover_opacity !== null) {
			return settings.hover_opacity;
		    } else {
			return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
		    }
                });
	    if (settings.has_url_var) {
                d3.select(this)
		    .style("cursor", function(d) {
			return (d.url_var != "" ? "pointer" : "default");
		    });
	    }
	    if (settings.has_tooltips) {
                tooltip.style("visibility", "visible")
		    .html(tooltip_content(d));
	    }
        });
        selection.on("mousemove", function(){
	    if (settings.has_tooltips) {
		tooltip.style("top", (d3.event.pageY+15)+"px").style("left",(d3.event.pageX+15)+"px");
	    }
        });
        selection.on("mouseout", function(){
            d3.select(this)
                .transition().duration(150)
                .attr("d", d3.symbol()
		      .type(function(d) { return d3.symbols[scales.symbol(d.symbol_var)]; })
		      .size(function(d) { return dot_size(d);})
		     )
                .style("opacity", function(d) {
			return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
		});
	    if (settings.has_tooltips) {
                    tooltip.style("visibility", "hidden");
	    }
        });
	selection.on("click", function(d, i) {
	    if (typeof settings.click_callback === 'function') {
		settings.click_callback(settings.html_id, i + 1);
	    }
	    if (settings.has_url_var && d.url_var != "") {
		var win = window.open(d.url_var, '_blank');
		win.focus();
	    }
        });
    }

    // Apply format to dot
    function dot_formatting(selection) {
        var sel = selection
            .attr("transform", translation)
        // fill color
            .style("fill", function(d) { return scales.color(d.col_var); })
	    .style("opacity", function(d) {
		return d.opacity_var !== undefined ? scales.opacity(d.opacity_var) : settings.point_opacity;
	    })
        // symbol and size
            .attr("d", d3.symbol()
		  .type(function(d) {return d3.symbols[scales.symbol(d.symbol_var)];})
		  .size(function(d) { return dot_size(d); })
		 )
            .attr("class", function(d,i) {
		return "dot symbol symbol-c" + css_clean(d.symbol_var) + " color color-c" + css_clean(d.col_var);
            });
        return sel;
    }

    // Arrow drawing function
    function draw_arrow(selection) {
        selection
            .attr("x1", function(d) { return scales.x(0); })
            .attr("y1", function(d) { return scales.y(0); })
            .attr("x2", function(d) { return scales.x(d.x); })
            .attr("y2", function(d) { return scales.y(d.y); });
    }

    // Initial arrow attributes
    function arrow_init (selection) {
        // tooltips when hovering points
        if (settings.has_tooltips) {
            var tooltip = d3.select(".scatterD3-tooltip");
            selection.on("mouseover", function(d, i){
                tooltip.style("visibility", "visible")
                    .html(tooltip_content(d));
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
    function arrow_formatting(selection) {
        var sel = selection
            .call(draw_arrow)
            .style("stroke-width", "1px")
        // stroke color
            .style("stroke", function(d) { return scales.color(d.col_var); })
            .attr("marker-end", function(d) { return "url(#arrow-head-" + settings.html_id + "-" + scales.color(d.col_var) + ")"; })
            .attr("class", function(d,i) { return "arrow color color-c" + css_clean(d.col_var); });
        if (settings.opacity_changed || settings.subset_changed || settings.redraw) {
            sel = sel.style("opacity", function(d) {
		return d.opacity_var !== undefined ? scales.opacity(d.opacity_var) : settings.point_opacity;
	    });
        }
        return sel;
    }

    // Initial ellipse attributes
    function ellipse_init(selection) {
        selection
            .style("fill", "none");
    }

    // Apply format to ellipse
    function ellipse_formatting(selection) {

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

    // Unit circle init
    function unit_circle_init(selection) {
        selection
            .attr('cx', scales.x(0))
            .attr('cy', scales.y(0))
            .attr('rx', scales.x(1)-scales.x(0))
            .attr('ry', scales.y(0)-scales.y(1))
            .style("stroke", "#888")
            .style("fill", "none")
            .style("opacity", "1");
    }

    // Initial text label attributes
    function label_init (selection) {
        selection
            .attr("text-anchor", "middle");
    }

    // Compute default vertical offset for labels
    function default_label_dy(size, y, type_var) {
        if (y < 0 && type_var !== undefined && type_var == "arrow") {
            return (Math.sqrt(size) / 2) + settings.labels_size + 2;
        }
        else {
            return (-Math.sqrt(size) / 2) - 6;
        }
    }

    // Apply format to text label
    function label_formatting (selection) {
        var sel = selection
            .text(function(d) {return(d.lab);})
            .style("font-size", settings.labels_size + "px")
            .attr("class", function(d,i) { return "point-label color color-c" + css_clean(d.col_var) + " symbol symbol-c" + css_clean(d.symbol_var); })
            .attr("transform", translation)
            .style("fill", function(d) { return scales.color(d.col_var); })
            .attr("dx", function(d) {
		if (d.lab_dx === undefined) return("0px");
		else return(d.lab_dx + "px");
            })
            .attr("dy", function(d) {
		if (d.lab_dy !== undefined) return(d.lab_dy + "px");
		var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
		return default_label_dy(size, d.y, d.type_var) + "px";
            });
        if (settings.opacity_changed || settings.subset_changed || settings.redraw) {
            sel = sel.style("opacity", 1);
        }
        return sel;
    }

    // Text labels dragging function
    var dragging = false;
    drag = d3.drag()
	.subject(function(d) {
            var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
            var dx = (d.lab_dx === undefined) ? 0 : d.lab_dx;
            var dy = (d.lab_dx === undefined) ? default_label_dy(size, d.y, d.type_var) : d.lab_dy;
            return {x:scales.x(d.x)+dx, y:scales.y(d.y)+dy};
	})
	.on('start', function(d) {
	    if (!d3.event.sourceEvent.shiftKey) {
		dragging = true;
		d3.select(this).style('fill', '#000');
		var chart = d3.select(this).node().parentNode;
		var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
		var dx = (d.lab_dx === undefined) ? 0 : d.lab_dx;
		var dy = (d.lab_dx === undefined) ? default_label_dy(size, d.y, d.type_var) : d.lab_dy;
		d3.select(chart).append("svg:line")
		    .attr("id", "scatterD3-drag-line")
		    .attr("x1", scales.x(d.x)).attr("x2", scales.x(d.x) + dx)
		    .attr("y1", scales.y(d.y)).attr("y2", scales.y(d.y) + dy)
		    .style("stroke", "#000")
		    .style("opacity", 0.3);
	    }
	})
	.on('drag', function(d) {
	    if (dragging) {
		var cx = d3.event.x - scales.x(d.x);
		var cy = d3.event.y - scales.y(d.y);
		d3.select(this)
		    .attr('dx', cx + "px")
		    .attr('dy', cy + "px");
		d3.select("#scatterD3-drag-line")
		    .attr('x2', scales.x(d.x) + cx)
		    .attr("y2", scales.y(d.y) + cy);
		d.lab_dx = cx;
		d.lab_dy = cy;
	    }
	})
	.on('end', function(d) {
	    if (dragging){
		d3.select(this).style('fill', scales.color(d.col_var));
		d3.select("#scatterD3-drag-line").remove();
		dragging = false;
	    }
	});


    // Filter points and arrows data
    function point_filter(d) {
	return d.type_var === undefined || d.type_var == "point";
    }
    function arrow_filter(d) {
	return d.type_var !== undefined && d.type_var == "arrow";
    }


    function chart(selection) {
        selection.each(function() {

            dims = setup_sizes(width, height, settings);
            scales = setup_scales(dims, settings, data);

            // Root chart element and axes
            var root = svg.append("g")
		.attr("class", "root")
		.attr("transform", "translate(" + dims.margins.left + "," + dims.margins.top + ")")
		.call(zoom);

            root.append("rect")
		.style("fill", "#FFF")
		.attr("width", dims.width)
		.attr("height", dims.height);

            root.call(add_axes);

            // <defs>
            var defs = svg.append("defs");
            // arrow head markers
	    if (!settings.col_continuous) {
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
		    .call(line_formatting);
	    }


            // Unit circle
            if (settings.unit_circle) {
		var unit_circle = chart_body.append('svg:ellipse')
		    .attr('class', 'unit-circle')
		    .call(unit_circle_init);
            }

            // Add points
            var dot = chart_body
		.selectAll(".dot")
		.data(data.filter(point_filter), key);
            dot.enter()
		.append("path")
		.call(dot_init)
		.call(dot_formatting);
            // Add arrows
            var arrow = chart_body
		.selectAll(".arrow")
		.data(data.filter(arrow_filter), key);
            arrow.enter()
		.append("svg:line")
		.call(arrow_init)
		.call(arrow_formatting);

            // Add ellipses
            if (settings.ellipses) {
		var ellipse = chart_body
		    .selectAll(".ellipse")
		    .data(settings.ellipses_data);
		ellipse.enter()
		    .append("svg:path")
		    .call(ellipse_init)
		    .call(ellipse_formatting);
            }

            // Add text labels
            if (settings.has_labels) {
                var labels = chart_body.selectAll(".point-label")
                    .data(data, key);

                labels.enter()
                    .append("text")
                    .call(label_init)
                    .call(label_formatting)
                    .call(drag);
            }

            // Legends
            if (settings.has_legend && settings.legend_width > 0) {
                var legend = svg.append("g").attr("class", "legend");
		dims = setup_legend_sizes(dims, scales, settings);
                // Color legend
                if (settings.has_color_var)
		    dims = add_color_legend(svg, dims, settings, scales, data);
                // Symbol legend
                if (settings.has_symbol_var)
		    dims = add_symbol_legend(svg, dims, settings, scales, data);
                // Size legend
                if (settings.has_size_var)
		    dims = add_size_legend(svg, dims, settings, scales, data);
            }

            // Tools menu
            if(settings.menu) {

		// Gear icon
		var gear = svg.append("g")
		    .attr("class", "gear-menu")
		    .attr("transform", "translate(" + (width - 36) + ", 6)");
		gear.append("rect")
		    .attr("class", "gear-toggle")
		    .attr("width", "25")
		    .attr("height", "25")
		    .style("fill", "#FFFFFF");
		gear.append("path")
		    .attr("d", gear_path())
		    .attr("transform", "translate(-3,3)")
		    .style("fill", "#666666");

		var menu_parent = d3.select(svg.node().parentNode);
		menu_parent.style("position", "relative");
		var menu = menu_parent.select(".scatterD3-menu");

		menu.attr("id", "scatterD3-menu-" + settings.html_id);

		menu.append("li")
		    .append("a")
		    .on("click", reset_zoom)
		    .html("Reset zoom");

		menu.append("li")
		    .append("a")
		    .on("click", export_svg)
		    .html("Export to SVG");

		if (settings.lasso) {
                    menu.append("li")
			.append("a")
			.attr("class", "lasso-entry")
			.on("click", function () {lasso_toggle(svg, settings, scales, zoom);})
			.html("Toggle lasso on");
		}

		if (settings.has_labels) {
                    menu.append("li")
			.append("a")
			.on("click", export_labels_position)
			.html("Export labels positions");
		}

		gear.on("click", function(d, i){
                    var menu = d3.select("#scatterD3-menu-" + settings.html_id);
                    var gear = svg.select(".gear-menu");
                    if (!menu.classed("open")) {
			menu.transition().duration(300)
			    .style("opacity", "0.95")
			    .style("width", "165px");
			gear.classed("selected", true);
			menu.classed("open", true);
                    } else {
			menu.transition().duration(300)
			    .style("opacity", "0")
			    .style("width", "0px");
			gear.classed("selected", false);
			menu.classed("open", false);
                    }
		});
            }

        });
    }


    // Update chart with transitions
    function update_settings(old_settings) {
	var chart_body = svg.select(".chart-body");
        if (old_settings.labels_size != settings.labels_size)
            svg.selectAll(".point-label").transition().style("font-size", settings.labels_size + "px");
        if (old_settings.point_size != settings.point_size ||
	    old_settings.point_opacity != settings.point_opacity)
            svg.selectAll(".dot").transition().call(dot_formatting);
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
                    .call(label_formatting)
                    .call(drag);
            }
        }
        if (old_settings.unit_circle != settings.unit_circle) {
            if (!settings.unit_circle) {
                var circle = svg.select(".unit-circle");
                circle.transition().duration(1000).call(unit_circle_init)
                    .style("opacity", "0").remove();
            }
            if (settings.unit_circle) {
                chart_body.append('svg:ellipse')
                    .attr('class', 'unit-circle')
                    .style("opacity", "0");
            }
        }
      	if (settings.menu) {
	          var menu_parent = d3.select(svg.node().parentNode);
	          menu_parent.style("position", "relative");
	          var menu = menu_parent.select(".scatterD3-menu");
	          menu.attr("id", "scatterD3-menu-" + settings.html_id);
      	}
    };

    // Update data with transitions
    function update_data() {

	scales = setup_scales(dims, settings, data);

	if (settings.has_legend_changed && settings.legend_width > 0) 
            resize_chart(1000);
	
	//setup_sizes();

        scales.xAxis = scales.xAxis.scale(scales.x).tickSize(-dims.height);
        scales.yAxis = scales.yAxis.scale(scales.y).tickSize(-dims.width);

	var t0 = svg.select(".root").transition().duration(1000);
	svg.select(".x-axis-label").text(settings.xlab);
	t0.select(".x.axis").call(scales.xAxis);
	svg.select(".y-axis-label").text(settings.ylab);
	    t0.select(".y.axis").call(scales.yAxis);
	
	t0.call(zoom.transform, d3.zoomIdentity);

	var chart_body = svg.select(".chart-body");
	// Add lines
	if (settings.lines !== null) {
	    var line = chart_body.selectAll(".line")
		.data(HTMLWidgets.dataframeToD3(settings.lines));
	    line.enter().append("path").call(line_init)
		.style("opacity", "0")
		.merge(line)
		.transition().duration(1000)
		.call(line_formatting)
		.style("opacity", "1");
	    line.exit().transition().duration(1000).style("opacity", "0").remove();
	}

	// Unit circle
	if (settings.unit_circle) t0.select(".unit-circle").call(unit_circle_init);

	// Add points
	var dot = chart_body.selectAll(".dot")
	    .data(data.filter(point_filter), key);
	dot.enter().append("path").call(dot_init)
	    .merge(dot).transition().duration(1000).call(dot_formatting);
	dot.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();
	// Add arrows
	var arrow = chart_body.selectAll(".arrow")
	    .data(data.filter(arrow_filter), key);
	arrow.enter().append("svg:line").call(arrow_init)
	    .style("opacity", "0")
	    .merge(arrow)
	    .transition().duration(1000)
	    .call(arrow_formatting).style("opacity", "1");
	arrow.exit().transition().duration(1000).style("opacity", "0").remove();

	// Add ellipses
	if (settings.ellipses || settings.ellipses_changed) {
            var ellipse = chart_body.selectAll(".ellipse")
		.data(settings.ellipses_data);
            ellipse.enter().append("path").call(ellipse_init)
		.style("opacity", "0")
		.merge(ellipse)
		.transition().duration(1000)
		.call(ellipse_formatting).style("opacity", "1");
            ellipse.exit().transition().duration(1000).style("opacity", "0").remove();
	}

	if (settings.has_labels) {
            var labels = chart_body.selectAll(".point-label")
		.data(data, key);
            labels.enter().append("text").call(label_init).call(drag)
		.merge(labels).transition().duration(1000).call(label_formatting);
            labels.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();
	}

	if (settings.legend_changed) {

            // Remove existing legends
            svg.select(".legend").remove();
            // Recreate them
            if (settings.has_legend && settings.legend_width > 0) {
		var legend = svg.append("g").attr("class", "legend");
		dims = setup_legend_sizes(dims, scales, settings);
                // Color legend
                if (settings.has_color_var)
		    dims = add_color_legend(svg, dims, settings, scales, data);
                // Symbol legend
                if (settings.has_symbol_var)
		    dims = add_symbol_legend(svg, dims, settings, scales, data);
                // Size legend
                if (settings.has_size_var)
		    dims = add_size_legend(svg, dims, settings, scales, data);
            }
	}

	lasso_off(svg, settings, zoom);
    };

    // Dynamically resize chart elements
    function resize_chart (transition) {
        // recompute sizes
        dims = setup_sizes(width, height, settings);
        // recompute scales
        scales.x.range([0, dims.width]);
        scales.x_orig.range([0, dims.width]);
        scales.y.range([dims.height, 0]);
        scales.y_orig.range([dims.height, 0]);
        scales.xAxis = scales.xAxis.scale(scales.x).tickSize(-dims.height);
        scales.yAxis = scales.yAxis.scale(scales.y).tickSize(-dims.width);
	var t;
	if (transition) {
	    t = svg.transition().duration(1000);
	} else {
	    t = svg;
	}
	// Change svg attributes
        t.select(".root")
            .attr("width", dims.width)
            .attr("height", dims.height);
        t.select(".root")
	    .select("rect")
            .attr("width", dims.width)
            .attr("height", dims.height);
        t.select(".chart-body")
            .attr("width", dims.width)
            .attr("height", dims.height);
	t.select(".x.axis")
	    .attr("transform", "translate(0," + dims.height + ")")
	    .call(scales.xAxis);
        t.select(".x-axis-label")
	    .attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")");
	t.select(".y.axis")
		.call(scales.yAxis);
	if (settings.unit_circle) {
            t.select(".unit-circle")
		.call(unit_circle_init);
	}
	if (!transition) {
	    t.select(".root").call(zoom.transform,
		      d3.zoomTransform(svg.select(".root").node()));
	}

        // Move legends
	if (settings.has_legend && settings.legend_width > 0) {
	    dims = setup_legend_sizes(dims, scales, settings);
            if (settings.has_color_var) 
		move_color_legend(t, dims);
            if (settings.has_symbol_var)
		move_symbol_legend(t, dims);
            if (settings.has_size_var)
		move_size_legend(t, dims);
	}
        // Move menu
        if (settings.menu) {
            t.select(".gear-menu")
		.attr("transform", "translate(" + (width - 40) + "," + 10 + ")");
        }

    };


    // Add controls handlers for shiny
    chart.add_controls_handlers = function() {
        // Zoom reset
        d3.select("#" + settings.dom_id_reset_zoom)
            .on("click", reset_zoom);

        // SVG export
        d3.select("#" + settings.dom_id_svg_export)
            .on("click", export_svg);

        // Lasso toggle
        d3.select("#" + settings.dom_id_lasso_toggle)
            .on("click", function () {lasso_toggle(svg, settings, scales, zoom);});
    };

    chart.add_global_listeners = function() {
	// Toogle zoom and lasso behaviors when shift is pressed
	var parent = d3.select("#scatterD3-svg-" + settings.html_id).node().parentNode;
	d3.select(parent)
	    .attr("tabindex", 0)
	    .on("keydown", function() {
		var key = d3.event.key !== undefined ? d3.event.key : d3.event.keyIdentifier;
		if (key == "Shift") {
		    if (settings.lasso) {
			lasso_on(svg, settings, scales, zoom);
		    }
		}
	    })
	    .on("keyup", function() {
		var key = d3.event.key !== undefined ? d3.event.key : d3.event.keyIdentifier;
		if (key == "Shift") {
		    if (settings.lasso) {
			lasso_off(svg, settings, zoom);
		    }
		}
	    });

    };

    // resize
    chart.resize = function() {
        resize_chart();
    };

    // settings getter/setter
    chart.data = function(value, redraw) {
        if (!arguments.length) return data;
        data = value;
        if (!redraw) update_data();
        return chart;
    };

    // settings getter/setter
    chart.settings = function(value) {
        if (!arguments.length) return settings;
        if (Object.keys(settings).length === 0) {
            settings = value;
        } else {
            var old_settings = settings;
            settings = value;
            update_settings(old_settings);
        }
        return chart;
    };

    chart.svg = function(value) {
        if (!arguments.length) return svg;
        svg = value;
        return chart;
    };

    // width getter/setter
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    // height getter/setter
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    return chart;
}



HTMLWidgets.widget({

    name: 'scatterD3',

    type: 'output',

    factory: function(el, width, height) {

        if (width < 0) width = 0;
        if (height < 0) height = 0;
        // Create root svg element
        var svg = d3.select(el).append("svg");
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
        var tooltip = d3.select(".scatterD3-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body")
		.append("div")
		.style("visibility", "hidden")
		.attr("class", "scatterD3-tooltip");
        }

        // Create menu div
        var menu = d3.select(el).select(".scatterD3-menu");
        if (menu.empty()) {
            menu = d3.select(el).append("ul")
		.attr("class", "scatterD3-menu");
        }

        // Create scatterD3 instance
        var scatter = scatterD3().width(width).height(height).svg(svg);

	return({
            resize: function(width, height) {

		if (width < 0) width = 0;
		if (height < 0) height = 0;
		// resize root svg element
		var svg = d3.select(el).select("svg");
		svg
		    .attr("width", width)
		    .attr("height", height);
		// resize chart
		scatter.width(width).height(height).svg(svg).resize();
            },

            renderValue: function(obj) {
		// Check if update or redraw
		var first_draw = (Object.keys(scatter.settings()).length === 0);
		var redraw = first_draw || !obj.settings.transitions;
		var svg = d3.select(el).select("svg").attr("id", "scatterD3-svg-" + obj.settings.html_id);
		scatter = scatter.svg(svg);

		// convert data to d3 format
		var data = HTMLWidgets.dataframeToD3(obj.data);

		// If no transitions, remove chart and redraw it
		if (!obj.settings.transitions) {
                    svg.selectAll("*:not(style)").remove();
		    menu.selectAll("li").remove();
		}

		// Complete draw
		if (redraw) {
                    scatter = scatter.data(data, redraw);
                    obj.settings.redraw = true;
                    scatter = scatter.settings(obj.settings);
                    // add controls handlers and global listeners for shiny apps
                    scatter.add_controls_handlers();
                    scatter.add_global_listeners();
                    // draw chart
                    d3.select(el)
			.call(scatter);
		}
		// Update only
		else {
		    // Array equality test
		    function array_equal (a1, a2) {
			return a1.length == a2.length && a1.every(function(v,i) { return v === a2[i];});
		    }

                    // Check what did change
                    obj.settings.has_legend_changed = scatter.settings().has_legend != obj.settings.has_legend;
                    obj.settings.has_labels_changed = scatter.settings().has_labels != obj.settings.has_labels;
                    obj.settings.size_range_changed = !array_equal(scatter.settings().size_range, obj.settings.size_range);
                    obj.settings.ellipses_changed = scatter.settings().ellipses != obj.settings.ellipses;
                    function changed(varname) {
			return obj.settings.hashes[varname] != scatter.settings().hashes[varname];
                    };
                    obj.settings.x_changed = changed("x");
                    obj.settings.y_changed = changed("y");
                    obj.settings.lab_changed = changed("lab");
                    obj.settings.legend_changed = changed("col_var") || changed("symbol_var") ||
			changed("size_var") || obj.settings.size_range_changed;
                    obj.settings.data_changed = obj.settings.x_changed || obj.settings.y_changed ||
			obj.settings.lab_changed || obj.settings.legend_changed ||
			obj.settings.has_labels_changed || changed("ellipses_data") ||
			obj.settings.ellipses_changed || changed("opacity_var") ||
			changed("lines");
                    obj.settings.subset_changed = changed("key_var");
                    scatter = scatter.settings(obj.settings);
                    // Update data only if needed
                    if (obj.settings.data_changed) scatter = scatter.data(data, redraw);
		}
            },

            s: scatter
	});
    }
});
