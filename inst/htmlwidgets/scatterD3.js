function scatterD3() {

    var width = 600, // default width
    height = 600, // default height
    dims = {},
    margin = {top: 5, right: 10, bottom: 20, left: 50, legend_top: 50},
    settings = {},
    data = [],
    x, y, color_scale, symbol_scale, size_scale,
    min_x, min_y, max_x, max_y, gap_x, gap_y,
    xAxis, yAxis,
    svg,
    zeroline, zoom, drag;

    function setup_sizes() {

        dims.legend_width = 0;
        if (settings.has_legend) dims.legend_width = settings.legend_width;

        dims.width = width - dims.legend_width;
        dims.height = height;
        dims.height = dims.height - margin.top - margin.bottom;
        dims.width = dims.width - margin.left - margin.right;

        // Fixed ratio
        if (settings.fixed) {
            dims.height = Math.min(dims.height, dims.width);
            dims.width = dims.height;
        }

        dims.total_width = dims.width + margin.left + margin.right + dims.legend_width;
        dims.total_height = dims.height + margin.top + margin.bottom;

        dims.legend_x = dims.total_width - margin.right - dims.legend_width + 24;
    }

    function setup_scales() {

        // x and y limits
        if (settings.xlim === null) {
            min_x = d3.min(data, function(d) { return(d.x);} );
            max_x = d3.max(data, function(d) { return(d.x);} );
            gap_x = (max_x - min_x) * 0.2;
        } else {
            min_x = settings.xlim[0];
            max_x = settings.xlim[1];
            gap_x = 0;
        }
        if (settings.ylim === null) {
            min_y = d3.min(data, function(d) { return(d.y);} );
            max_y = d3.max(data, function(d) { return(d.y);} );
            gap_y = (max_y - min_y) * 0.2;
        } else {
            min_y = settings.ylim[0];
            max_y = settings.ylim[1];
            gap_y = 0;
        }

        // Fixed ratio
        if (settings.fixed) {
          if (settings.xlim === null && settings.ylim === null) {
            min_x = min_y = Math.min(min_x, min_y);
            max_x = max_y = Math.max(max_x, max_y);
            gap_x = gap_y = Math.max(gap_x, gap_y);
          }
          if (settings.xlim !== null) {
            min_y = min_x;
            max_y = max_x;
            gap_y = gap_x;
          }
          if (settings.ylim !== null) {
            min_x = min_y;
            max_x = max_y;
            gap_x = gap_y;
          }

        }

        // x, y, color, symbol and size scales
        x = d3.scale.linear().range([0, dims.width]);
        y = d3.scale.linear().range([dims.height, 0]);
        x.domain([min_x - gap_x, max_x + gap_x]);
        y.domain([min_y - gap_y, max_y + gap_y]);
        if (settings.colors === null) {
            // Number of different levels. See https://github.com/mbostock/d3/issues/472
            var n = d3.map(data, function(d) { return d.col_var; }).size();
            color_scale = n <= 10 ? d3.scale.category10() : d3.scale.category20();
        } else if (Array.isArray(settings.colors)) {
            color_scale = d3.scale.ordinal().range(settings.colors);
        } else if (typeof(settings.colors) === "object"){
            color_scale = d3.scale.ordinal()
                          .range(d3.values(settings.colors))
                          .domain(d3.keys(settings.colors));
        }
        symbol_scale = d3.scale.ordinal().range(d3.range(d3.svg.symbolTypes.length));
        size_scale = d3.scale.linear()
        .range(settings.size_range)
        .domain([d3.min(data, function(d) { return(d.size_var);} ),
                 d3.max(data, function(d) { return(d.size_var);} )]);

        // zoom behavior
        zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0, 32])
        .on("zoom", function() {
             zoomed();
         });

        // x and y axis functions
        xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-dims.height);
        yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-dims.width);

    }

    // Key function to identify rows when interactively filtering
    function key(d) {
        return d.key_var;
    }

    // Default translation function for points and labels
    function translation(d) {
        return "translate(" + x(d.x) + "," + y(d.y) + ")";
    }

    // Zoom function
    function zoomed(reset) {

        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll(".dot, .point-label")
        .attr("transform", translation);
        svg.selectAll(".arrow").call(draw_arrow);
        svg.selectAll(".ellipse").call(ellipse_formatting);
        var zeroline = d3.svg.line()
        .x(function(d) {return x(d.x)})
        .y(function(d) {return y(d.y)});
        svg.select(".zeroline.hline").attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
        svg.select(".zeroline.vline").attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));
        svg.select(".unit-circle").call(unit_circle_init);

    }

    // Create and draw x and y axes
    function add_axes(selection) {

        // x axis
        selection.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dims.height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "axis-label")
        .attr("x", dims.width - 5)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(settings.xlab);

        // y axis
        selection.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -5)
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(settings.ylab);

    }

    // Zero horizontal and vertical lines
    zeroline = d3.svg.line()
    .x(function(d) {return x(d.x)})
    .y(function(d) {return y(d.y)});

    // Create tooltip content function
    function tooltip_content(d) {
        // no tooltips
        if (!settings.has_tooltips) return null;
        if (settings.has_custom_tooltips) {
            // custom tooltips
            return d.tooltip_text;
        } else {
            // default tooltips
            var text = Array();
            if (settings.has_labels) text.push("<b>"+d.lab+"</b>");
            text.push("<b>"+settings.xlab+":</b> "+d.x.toFixed(3));
            text.push("<b>"+settings.ylab+":</b> "+d.y.toFixed(3));
            if (settings.has_color_var) text.push("<b>"+settings.col_lab+":</b> "+d.col_var);
            if (settings.has_symbol_var) text.push("<b>"+settings.symbol_lab+":</b> "+d.symbol_var);
            if (settings.has_size_var) text.push("<b>"+settings.size_lab+":</b> "+d.size_var);
            return text.join("<br />");
        }
    }

    // Clean variables levels to be valid CSS classes
    function css_clean(s) {
      if (s === undefined) return "";
      return s.toString().replace(/[^\w-]/g, "_");
    }

    // Initial dot attributes
    function dot_init (selection) {
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

    // Apply format to dot
    function dot_formatting(selection) {
        selection
        .attr("transform", translation)
        .style("opacity", settings.point_opacity)
        // fill color
        .style("fill", function(d) { return color_scale(d.col_var); })
        // symbol and size
        .attr("d", d3.svg.symbol()
            .type(function(d) {return d3.svg.symbolTypes[symbol_scale(d.symbol_var)]})
            .size(function(d) {
                if (settings.has_size_var) { return size_scale(d.size_var)}
                else { return settings.point_size }
            })
        )
        .attr("class", function(d,i) {
          return "dot symbol symbol-c" + css_clean(d.symbol_var) + " color color-c" + css_clean(d.col_var);
        })
    }

    // Arrow drawing function
    function draw_arrow(selection) {
        selection
        .attr("x1", function(d) { return x(0) })
        .attr("y1", function(d) { return y(0) })
        .attr("x2", function(d) { return x(d.x) })
        .attr("y2", function(d) { return y(d.y) });
    }

    // Initial arrow attributes
    function arrow_init (selection) {
        selection
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
        selection
        .call(draw_arrow)
        .style("stroke-width", "1px")
        .style("opacity", settings.point_opacity)
        // stroke color
        .style("stroke", function(d) { return color_scale(d.col_var); })
        .attr("marker-end", function(d) { return "url(#arrow-head-" + settings.html_id + "-" + color_scale(d.col_var) + ")" })
        .attr("class", function(d,i) { return "arrow color color-c" + css_clean(d.col_var) });
    }

    // Initial ellipse attributes
    function ellipse_init(selection) {
        selection
        .style("fill", "none");
    }

    // Apply format to ellipse
    function ellipse_formatting(selection) {

        // Ellipses path function
        var ellipseFunc = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

        selection
        .attr("d", function(d) {
          var ell = HTMLWidgets.dataframeToD3(d.data);
          return (ellipseFunc(ell))
        })
        .style("stroke", function(d) {
            // Only one ellipse
            if (d.level == "_scatterD3_all") {
                return(color_scale.range()[0]);
            }
            return( color_scale(d.level))
        })
        .style("opacity", 1)
        .attr("class", function(d) {
            return "ellipse color color-c" + css_clean(d.level);
        });
    }

    // Unit circle init
    function unit_circle_init(selection) {
        selection
        .attr('cx', x(0))
        .attr('cy', y(0))
        .attr('rx', x(1)-x(0))
        .attr('ry', y(0)-y(1))
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
        selection
        .text(function(d) {return(d.lab)})
        .style("font-size", settings.labels_size + "px")
        .attr("class", function(d,i) { return "point-label color color-c" + css_clean(d.col_var) + " symbol symbol-c" + css_clean(d.symbol_var); })
        .attr("transform", translation)
        .style("fill", function(d) { return color_scale(d.col_var); })
        .attr("dx", function(d) {
            if (d.lab_dx === undefined) return("0px");
            else return(d.lab_dx + "px");
        })
        .attr("dy", function(d) {
            if (d.lab_dy !== undefined) return(d.lab_dy + "px");
            var size = (d.size_var === undefined) ? settings.point_size : size_scale(d.size_var);
            return default_label_dy(size, d.y, d.type_var) + "px";
        });
    }

    // Text labels dragging function
    drag = d3.behavior.drag()
    .origin(function(d) {
        var size = (d.size_var === undefined) ? settings.point_size : size_scale(d.size_var);
        var dx = (d.lab_dx === undefined) ? 0 : d.lab_dx;
        var dy = (d.lab_dx === undefined) ? default_label_dy(size, d.y, d.type_var) : d.lab_dy;
        return {x:x(d.x)+dx, y:y(d.y)+dy};
    })
    .on('dragstart', function(d) {
      d3.select(this).style('fill', '#000');
      var chart = d3.select(this).node().parentNode;
      var size = (d.size_var === undefined) ? settings.point_size : size_scale(d.size_var);
      var dx = (d.lab_dx === undefined) ? 0 : d.lab_dx;
      var dy = (d.lab_dx === undefined) ? default_label_dy(size, d.y, d.type_var) : d.lab_dy;
      d3.select(chart).append("svg:line")
      .attr("id", "scatterD3-drag-line")
      .attr("x1", x(d.x)).attr("x2", x(d.x) + dx)
      .attr("y1", y(d.y)).attr("y2", y(d.y) + dy)
      .style("stroke", "#000")
      .style("opacity", 0.3);
    })
    .on('drag', function(d) {
        cx = d3.event.x - x(d.x);
        cy = d3.event.y - y(d.y);
        d3.select(this)
        .attr('dx', cx + "px")
        .attr('dy', cy + "px");
        d3.select("#scatterD3-drag-line")
        .attr('x2', x(d.x) + cx)
        .attr("y2", y(d.y) + cy);
        d.lab_dx = cx;
        d.lab_dy = cy;
    })
    .on('dragend', function(d) {
      d3.select(this).style('fill', color_scale(d.col_var));
      d3.select("#scatterD3-drag-line").remove();
    });

    // Format legend label
    function legend_label_formatting (selection, margin_top) {
        selection
        .style("text-anchor", "beginning")
        .style("fill", "#000")
        .style("font-weight", "bold");
    }

    // Create color legend
    function add_color_legend() {

        var legend = svg.select(".legend");

        var legend_color_domain = color_scale.domain().sort();
        var legend_color_scale = d3.scale.category10();

        legend_color_scale
        .domain(legend_color_domain)
        .range(legend_color_domain.map(function(d) {return color_scale(d)}));

        var color_legend = d3.legend.color()
        .shapePadding(3)
        .shape("rect")
        .scale(legend_color_scale)
        .on("cellover", function(d) {
            d = css_clean(d);
            var nsel = ".color:not(.color-c" + d + ")";
            var sel = ".color-c" + d;
            svg.selectAll(nsel)
            .transition()
            .style("opacity", 0.2);
            svg.selectAll(sel)
            .transition()
            .style("opacity", 1);
        })
        .on("cellout", function(d) {
            var sel = ".color";
            svg.selectAll(sel)
            .transition()
            .style("opacity", settings.point_opacity);
            svg.selectAll(".point-label")
            .transition()
            .style("opacity", 1);
        });

        legend.append("g")
        .append("text")
        .attr("class", "color-legend-label")
        .attr("transform", "translate(" + dims.legend_x + "," + margin.legend_top + ")")
        .text(settings.col_lab)
        .call(legend_label_formatting);

        legend.append("g")
        .attr("class", "color-legend")
        .attr("transform", "translate(" + dims.legend_x + "," + (margin.legend_top + 8) + ")")
        .call(color_legend);
    }

    // Create symbol legend
    function add_symbol_legend() {

        var legend = svg.select(".legend");

        // Height of color legend
        var color_legend_height = settings.has_color_var ? color_scale.domain().length * 20 + 30 : 0;
        margin.symbol_legend_top = color_legend_height + margin.legend_top;

        var legend_symbol_domain = symbol_scale.domain().sort();
        var legend_symbol_scale = d3.scale.ordinal()
        .domain(legend_symbol_domain)
        .range(legend_symbol_domain.map(function(d) {return d3.svg.symbol().type(d3.svg.symbolTypes[symbol_scale(d)])()}));

        var symbol_legend = d3.legend.symbol()
        .shapePadding(5)
        .scale(legend_symbol_scale)
        .on("cellover", function(d) {
            d = css_clean(d);
            var nsel = ".symbol:not(.symbol-c" + d + ")";
            var sel = ".symbol-c" + d;
            svg.selectAll(nsel)
            .transition()
            .style("opacity", 0.2);
            svg.selectAll(sel)
            .transition()
            .style("opacity", 1);
        })
        .on("cellout", function(d) {
            var sel = ".symbol";
            svg.selectAll(sel)
            .transition()
            .style("opacity", settings.point_opacity);
            svg.selectAll(".point-label")
            .transition()
            .style("opacity", 1);
        });

        legend.append("g")
        .append("text")
        .attr("class", "symbol-legend-label")
        .attr("transform", "translate(" + dims.legend_x + "," + margin.symbol_legend_top + ")")
        .text(settings.symbol_lab)
        .call(legend_label_formatting);

        legend.append("g")
        .attr("class", "symbol-legend")
        .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.symbol_legend_top + 14) + ")")
        .call(symbol_legend);

    }

    // Create size legend
    function add_size_legend() {

        var legend = svg.select(".legend");

        // Height of color and symbol legends
        var color_legend_height = settings.has_color_var ? color_scale.domain().length * 20 + 30 : 0;
        var symbol_legend_height = settings.has_symbol_var ? symbol_scale.domain().length * 20 + 30 : 0;
        margin.size_legend_top = color_legend_height + symbol_legend_height + margin.legend_top;

        var legend_size_scale = d3.scale.linear()
        .domain(size_scale.domain())
        // FIXME : find exact formula
        .range(size_scale.range().map(function(d) {return Math.sqrt(d)/1.8}));

        var size_legend = d3.legend.size()
        .shapePadding(3)
        .shape('circle')
        .scale(legend_size_scale);

        legend.append("g")
        .append("text")
        .attr("class", "size-legend-label")
        .attr("transform", "translate(" + dims.legend_x + "," + margin.size_legend_top + ")")
        .text(settings.size_lab)
        .call(legend_label_formatting);

        legend.append("g")
        .attr("class", "size-legend")
        .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.size_legend_top + 14) + ")")
        .call(size_legend);

    }

    // Filter points and arrows data
    function point_filter(d) {
      return d.type_var === undefined || d.type_var == "point";
    }
    function arrow_filter(d) {
      return d.type_var !== undefined && d.type_var == "arrow";
    }


    function chart(selection) {
        selection.each(function() {

            setup_sizes();
            setup_scales();

            // Root chart element and axes
            root = svg.append("g")
            .attr("class", "root")
            .style("fill", "#FFF")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(add_axes);

            // <defs>
            var defs = svg.append("defs");
            // clipping rectangle
            defs.append("clipPath")
            .attr('id', 'scatterclip-' + settings.html_id)
            .append('rect')
            .attr('class', 'cliprect')
            .attr('width', dims.width)
            .attr('height', dims.height);
            // arrow head markers
            color_scale.range().forEach(function(d) {
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

            // zoom pane
            root.append("rect")
            .attr("class", "pane")
            .attr("width", dims.width)
            .attr("height", dims.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);

            // chart body
            var chart_body = root.append("g")
            .attr("class", "chart-body")
            .attr("width", dims.width)
            .attr("height", dims.height)
            .attr("clip-path", "url(" + document.location.href + "#scatterclip-" + settings.html_id + ")");

             chart_body.append("path")
            .attr("class", "zeroline hline")
            .attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
            chart_body.append("path")
            .attr("class", "zeroline vline")
            .attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));

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
                // Color legend
                if (settings.has_color_var) {
                    add_color_legend.svg = svg;
                    add_color_legend(legend);
                }
                // Symbol legend
                if (settings.has_symbol_var) {
                    add_symbol_legend.svg = svg;
                    add_symbol_legend(legend);
                }
                // Size legend
                if (settings.has_size_var) add_size_legend(legend);
            }

        });
    }


    // Update chart with transitions
    function update_settings(old_settings) {
        if (old_settings.point_opacity != settings.point_opacity)
            svg.selectAll(".dot").transition().style("opacity", settings.point_opacity);
        if (old_settings.labels_size != settings.labels_size)
            svg.selectAll(".point-label").transition().style("font-size", settings.labels_size + "px");
        if (old_settings.point_size != settings.point_size)
            svg.selectAll(".dot").transition().call(dot_formatting);
        if (old_settings.has_labels != settings.has_labels) {
            if (!settings.has_labels) {
                svg.selectAll(".point-label").remove();
            }
            if (settings.has_labels) {
                var chart_body = svg.select(".chart-body");
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
                var chart_body = svg.select(".chart-body");
                chart_body.append('svg:ellipse')
                .attr('class', 'unit-circle')
                .style("opacity", "0");
            }
        }
    };

    // Update data with transitions
    function update_data() {

      if (settings.has_legend_changed && settings.legend_width > 0)
            resize_chart();

      setup_sizes();
      setup_scales();

      var t0 = svg.transition().duration(1000);
      svg.select(".x.axis .axis-label").text(settings.xlab);
      t0.select(".x.axis").call(xAxis);
      t0.select(".zeroline.vline").attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));
      svg.select(".y.axis .axis-label").text(settings.ylab);
      t0.select(".y.axis").call(yAxis);
      t0.select(".zeroline.hline").attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
      svg.select(".pane").call(zoom);
      zoom.x(x);
      zoom.y(y);
      // Unit circle
      if (settings.unit_circle) t0.select(".unit-circle").call(unit_circle_init);

      var chart_body = svg.select(".chart-body");

      // Add points
      var dot = chart_body
      .selectAll(".dot")
      .data(data.filter(point_filter), key);
      dot.enter().append("path").call(dot_init);
      dot.transition().duration(1000).call(dot_formatting);
      dot.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();
      // Add arrows
      var arrow = chart_body
      .selectAll(".arrow")
      .data(data.filter(arrow_filter), key);
      arrow.enter().append("svg:line").call(arrow_init)
      .style("opacity", "0")
      .transition().duration(1000)
      .style("opacity", "1");
      arrow.transition().duration(1000).call(arrow_formatting);
      arrow.exit().transition().duration(1000).style("opacity", "0").remove();

      // Add ellipses
      if (settings.ellipses || settings.ellipses_changed) {
          var ellipse = chart_body
          .selectAll(".ellipse")
          .data(settings.ellipses_data);
          ellipse.enter().append("path").call(ellipse_init)
          .style("opacity", "0")
          .transition().duration(1000)
          .style("opacity", "1");
          ellipse.transition().duration(1000).call(ellipse_formatting);
          ellipse.exit().transition().duration(1000).style("opacity", "0").remove();
      }

      if (settings.has_labels) {
          var labels = chart_body.selectAll(".point-label")
          .data(data, key);
          labels.enter().append("text").call(label_init).call(drag);
          labels.transition().duration(1000).call(label_formatting);
          labels.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();
      }

      if (settings.legend_changed) {
          var legend = svg.select(".legend");
          // Remove existing legends
          legend.selectAll("*").remove();
          // Recreate them
          if (settings.has_legend && settings.legend_width > 0) {
              // Color legend
              if (settings.has_color_var) {
                add_color_legend(legend);
              }
              // Symbol legend
              if (settings.has_symbol_var) {
                add_symbol_legend(legend);
              }
              // Size legend
              if (settings.has_size_var) add_size_legend(legend);
          }
      }
    };

    // Dynamically resize chart elements
    function resize_chart () {
        // recompute sizes
        setup_sizes();
        // recompute scales and zoom
        var cache_translate = zoom.translate();
        var cache_scale = zoom.scale();
        zoom.scale(1).translate([0, 0]);
        x.range([0, dims.width]);
        y.range([dims.height, 0]);
        xAxis.scale(x).tickSize(-dims.height);
        yAxis.scale(y).tickSize(-dims.width);
        zoom.x(x);
        zoom.y(y);
        zoom.translate(cache_translate);
        zoom.scale(cache_scale);
        // Change svg attributes
        svg.select(".root").attr("width", dims.width).attr("height", dims.height);
        svg.select(".cliprect").attr("width", dims.width).attr("height", dims.height);
        svg.select(".pane").attr("width", dims.width).attr("height", dims.height).call(zoom);
        svg.select(".chart-body").attr("width", dims.width).attr("height", dims.height);
        svg.select(".x.axis").attr("transform", "translate(0," + dims.height + ")").call(xAxis);
        svg.select(".x.axis .axis-label").attr("x", dims.width - 5);
        svg.select(".y.axis").call(yAxis);
        svg.select(".unit-circle").call(unit_circle_init);

        svg.selectAll(".dot").attr("transform", translation);
        svg.selectAll(".arrow").call(draw_arrow);
        svg.selectAll(".ellipse").call(ellipse_formatting);
        if (settings.has_labels) {
            svg.selectAll(".point-label")
            .attr("transform", translation);
        }
        // Move zerolines
        var zeroline = d3.svg.line()
        .x(function(d) {return x(d.x)})
        .y(function(d) {return y(d.y)});
        svg.select(".zeroline.hline").attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
        svg.select(".zeroline.vline").attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));
        // Move legends
        if (settings.has_color_var) {
            svg.select(".color-legend-label")
            .attr("transform", "translate(" + dims.legend_x + "," + margin.legend_top + ")");
            svg.select(".color-legend")
            .attr("transform", "translate(" + dims.legend_x + "," + (margin.legend_top + 12) + ")");
        }
        if (settings.has_symbol_var) {
            svg.select(".symbol-legend-label")
            .attr("transform", "translate(" + dims.legend_x + "," + margin.symbol_legend_top + ")");
            svg.select(".symbol-legend")
            .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.symbol_legend_top + 14) + ")");
        }
        if (settings.has_size_var) {
            svg.select(".size-legend-label")
            .attr("transform", "translate(" + dims.legend_x + "," + margin.size_legend_top + ")");
            svg.select(".size-legend")
            .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.size_legend_top + 14) + ")");
        }


    };

    // Add controls handlers for shiny
    chart.add_controls_handlers = function() {

        // Zoom reset
        d3.select("#" + settings.dom_id_reset_zoom).on("click", function() {
            d3.transition().duration(750).tween("zoom", function() {
                var ix = d3.interpolate(x.domain(), [min_x - gap_x, max_x + gap_x]),
                iy = d3.interpolate(y.domain(), [min_y - gap_y, max_y + gap_y]);
                return function(t) {
                    zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
                    zoomed(reset = true);
                };
            })
        });

        // SVG export
        d3.select("#" + settings.dom_id_svg_export)
        .on("click", function(){
            var svg_content = svg
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", 1.1)
            .node().parentNode.innerHTML;
            svg_content = svg_content.replace(/clip-path="url\(.*?(#.*?)\)"/,
                                              'clip-path="url($1)"');
            var imageUrl = "data:image/octet-stream;base64,\n" + btoa(svg_content);
            d3.select(this)
            .attr("download", "scatterD3.svg")
            .attr("href", imageUrl);
        });
    };

    // resize
    chart.resize = function() {
        resize_chart();
    }

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
            // update dims and scales
            setup_sizes();
            setup_scales();
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
    }

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

    initialize: function(el, width, height) {

        if (width < 0) width = 0;
        if (height < 0) height = 0;
        // Create root svg element
        var svg = d3.select(el).append("svg");
        svg
        .attr("width", width)
        .attr("height", height)
        .attr("class", "scatterD3")
        .append("style")
        .text(".scatterD3 {font: 10px sans-serif;}" +
        ".scatterD3 .axis line, .axis path { stroke: #000; fill: none; shape-rendering: CrispEdges;} " +
        ".scatterD3 .axis .tick line { stroke: #ddd;} " +
        ".scatterD3 .axis text { fill: #000; } " +
        ".scatterD3 .zeroline { stroke-width: 1; stroke: #444; stroke-dasharray: 5,5;} ");

        // Create tooltip content div
        var tooltip = d3.select(".scatterD3-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body")
            .append("div")
            .style("visibility", "hidden")
            .attr("class", "scatterD3-tooltip");
        }

        // Create scatterD3 instance
        return scatterD3().width(width).height(height).svg(svg);
    },

    resize: function(el, width, height, scatter) {

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

    renderValue: function(el, obj, scatter) {
        // Check if update or redraw
        var first_draw = (Object.keys(scatter.settings()).length === 0);
        var redraw = first_draw || !obj.settings.transitions;
        var svg = d3.select(el).select("svg").attr("id", "scatterD3-svg-" + obj.settings.html_id);
        scatter = scatter.svg(svg);

        // convert data to d3 format
        data = HTMLWidgets.dataframeToD3(obj.data);

        // If no transitions, remove chart and redraw it
        if (!obj.settings.transitions) {
            svg.selectAll("*:not(style)").remove();
        }

        // Complete draw
        if (redraw) {
            scatter = scatter.data(data, redraw);
            scatter = scatter.settings(obj.settings);
            // add controls handlers for shiny apps
            scatter.add_controls_handlers();
            // draw chart
            d3.select(el)
            .call(scatter);
        }
        // Update only
        else {
            // Check what did change
            obj.settings.has_legend_changed = scatter.settings().has_legend != obj.settings.has_legend;
            obj.settings.has_labels_changed = scatter.settings().has_labels != obj.settings.has_labels;
            obj.settings.size_range_changed = scatter.settings().size_range != obj.settings.size_range;
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
                                        obj.settings.ellipses_changed;
            scatter = scatter.settings(obj.settings);
            // Update data only if needed
            if (obj.settings.data_changed) scatter = scatter.data(data, redraw);
        }
    }

});
