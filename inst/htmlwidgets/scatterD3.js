
function scatterD3() {

    var width = 600, // default width
    height = 600, // default height
    dims = {},
    margin = {top: 5, right: 10, bottom: 20, left: 50, legend_top: 50},
    settings = {},
    x, y, color_scale, symbol_scale, size_scale,
    xAxis, yAxis,
    svg,
    zoom;

    function setup_sizes() {
        dims.legend_width = 0;
        if (settings.has_legend) dims.legend_width = settings.legend_width;

        dims.width = width - dims.legend_width;
        dims.height = height;

        // Fixed ratio
        if (settings.fixed) {
            dims.height = Math.min(dims.height, dims.width);
            dims.width = dims.height;
        }

        dims.height = dims.height - margin.top - margin.bottom;
        dims.width = dims.width - margin.left - margin.right;
        dims.total_width = dims.width + margin.left + margin.right + dims.legend_width;
        dims.total_height = dims.height + margin.top + margin.bottom;

        dims.legend_x = dims.total_width - margin.right - dims.legend_width + 24;
    }

    function setup_scales() {

        // x and y limits
        if (settings.xlim === null) {
            min_x = d3.min(data, function(d) { return Math.min(d.x);} );
            max_x = d3.max(data, function(d) { return Math.max(d.x);} );
            gap_x = (max_x - min_x) * 0.2;
        } else {
            min_x = settings.xlim[0];
            max_x = settings.xlim[1];
            gap_x = 0;
        }
        if (settings.ylim === null) {
            min_y = d3.min(data, function(d) { return Math.min(d.y);} );
            max_y = d3.max(data, function(d) { return Math.max(d.y);} );
            gap_y = (max_y - min_y) * 0.2;
        } else {
            min_y = settings.ylim[0];
            max_y = settings.ylim[1];
            gap_y = 0;
        }

        // x, y, color, symbol and size scales
        x = d3.scale.linear().range([0, dims.width]);
        y = d3.scale.linear().range([dims.height, 0]);
        x.domain([min_x - gap_x, max_x + gap_x]);
        y.domain([min_y - gap_y, max_y + gap_y]);
        if (settings.colors == null) {
            color_scale = d3.scale.category10();
        } else {
            console.log(settings.colors);
            color_scale = d3.scale.ordinal().range(settings.colors);
        }
        symbol_scale = d3.scale.ordinal().range(d3.range(d3.svg.symbolTypes.length));
        size_scale = d3.scale.linear()
        .range(settings.size_range)
        .domain([d3.min(data, function(d) { return Math.min(d.size_var);} ),
                 d3.max(data, function(d) { return Math.min(d.size_var);} )])

        // zoom behavior
        zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([1, 32])
        .on("zoom", zoomed);

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

    // Default translation function for points and labels
    function translation(d) {
        return "translate(" + x(d.x) + "," + y(d.y) + ")";
    }

    // Zoom function
    function zoomed(reset) {

        // if (!reset) {
        //     var t = d3.event.translate;
        //     var s = d3.event.scale;
        //     zscale = s;
        //     t[0] = Math.min(
        //         (dims.width/dims.height)  * (s - 1),
        //         Math.max( dims.width * (1 - s), t[0] )
        //     );
        //     t[1] = Math.min(
        //         (dims.width/dims.height)  * (s - 1),
        //         Math.max( dims.width * (1 - s), t[1] )
        //     );
        //     zoom.translate(t);
        // }

        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll(".dot, .point-label")
        .attr("transform", translation);
        var zeroline = d3.svg.line()
        .x(function(d) {return x(d.x)})
        .y(function(d) {return y(d.y)});
        svg.select(".zeroline.hline").attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
        svg.select(".zeroline.vline").attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));
    }

    // Create and draw x and y axes
    function add_axes() {

        root = svg.select(".root");

        // x axis
        root.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dims.height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", dims.width - 5)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(settings.xlab);

        // y axis
        root.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x", -5)
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(settings.ylab);

    }

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
            if (settings.has_color_legend) text.push("<b>"+settings.col_lab+":</b> "+d.col_var);
            if (settings.has_symbol_legend) text.push("<b>"+settings.symbol_lab+":</b> "+d.symbol_var);
            return text.join("<br />");
        }
    }


    function chart(selection) {
        selection.each(function(data) {

            svg = d3.select(this).select("svg");

            // Root chart element
            root = svg.append("g")
            .attr("class", "root")
            .style("fill", "#FFF")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // clipping rectangle
            root.append("clipPath")
            .attr('id', 'clip')
            .append('rect')
            .attr("class", "cliprect")
            .style("stroke-width", 0)
            .attr('width', dims.width)
            .attr('height', dims.height)
            .style("fill", "none");

            // add x and y axes
            add_axes(root);

            // zoom pane
            root.append("rect")
            .attr("class", "pane")
            .attr("width", dims.width)
            .attr("height", dims.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);

            // chart body
            var chartBody = root.append("g")
            .attr("class", "chart-body")
            .attr("width", dims.width)
            .attr("height", dims.height)
            .attr("clip-path", "url(#clip)");

            // Zero horizontal and vertical lines
            var zeroline = d3.svg.line()
            .x(function(d) {return x(d.x)})
            .y(function(d) {return y(d.y)});
            chartBody.append("path")
            .attr("class", "zeroline hline")
            .attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
            chartBody.append("path")
            .attr("class", "zeroline vline")
            .attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));

            // Add points
            var dot = chartBody
            .selectAll(".dot")
            .data(data);

            dot.enter().append("path")
            .attr("transform", translation)
            .attr("class", function(d,i) { return "dot color color-" + d.col_var + " symbol symbol-" + d.symbol_var; })
            .style("opacity", settings.point_opacity)
            .style("fill", function(d) { return color_scale(d.col_var); })
            .attr("d", d3.svg.symbol()
                .type(function(d) {return d3.svg.symbolTypes[symbol_scale(d.symbol_var)]})
                .size(function(d) {
                    if (settings.has_size_legend) { return size_scale(d.size_var)}
                    else { return settings.point_size };
                })
            );

            // tooltips when hovering points
            if (settings.has_tooltips) {
                var tooltip = d3.select(".scatterD3-tooltip");
                dot.on("mouseover", function(d, i){
                    tooltip.style("visibility", "visible")
                    .html(tooltip_content(d));
                })
                .on("mousemove", function(){
                    tooltip.style("top", (event.pageY+15)+"px").style("left",(event.pageX+15)+"px");
                })
                .on("mouseout", function(){
                    tooltip.style("visibility", "hidden");
                });
            }

            // Text labels dragging
            function default_dy(size) {
                return (-Math.sqrt(size) / 2) - 10;
            }
            var drag = d3.behavior.drag()
            .origin(function(d) {
                var size = (d.size_var === undefined) ? settings.point_size : size_scale(d.size_var);
                dx = (d.lab_dx === undefined) ? 0 : d.lab_dx;
                dy = (d.lab_dx === undefined) ? default_dy(size) : d.lab_dy;
                return {x:x(d.x)+dx, y:y(d.y)+dy};
            })
            .on('dragstart', function(d) { d3.select(this).style('fill', '#000'); })
            .on('drag', function(d) {
                cx = d3.event.x - x(d.x);
                cy = d3.event.y - y(d.y);
                d3.select(this).attr('dx', cx + "px");
                d3.select(this).attr('dy', cy + "px");
                d.lab_dx = cx;
                d.lab_dy = cy;
            })
            .on('dragend', function(d) { d3.select(this).style('fill', color_scale(d.col_var)); });

            // Add text labels
            if (settings.has_labels) {
                chartBody.selectAll(".point-label")
                .data(data)
                .enter().append("text")
                .attr("class", function(d,i) { return "point-label color color-" + d.col_var + " symbol symbol-" + d.symbol_var; })
                .attr("transform", translation)
                .style("fill", function(d) { return color_scale(d.col_var); })
                .style("font-size", settings.labels_size + "px")
                .style("opacity", settings.point_opacity)
                .attr("text-anchor", "middle")
                .attr("dx", function(d) {
                    if (d.lab_dx === undefined) return("0px");
                    else return(d.lab_dx + "px");
                })
                .attr("dy", function(d) {
                    if (d.lab_dy !== undefined) return(d.lab_dy + "px");
                    var size = (d.size_var === undefined) ? settings.point_size : size_scale(d.size_var);
                    return default_dy(size) + "px";
                })
                .text(function(d) {return(d.lab)})
                .call(drag);
            }

            // Color legend
            if (settings.has_color_legend) {

                var legend_color_domain = color_scale.domain().sort();
                var legend_color_scale = d3.scale.category10();
                legend_color_scale
                .domain(legend_color_domain)
                .range(legend_color_domain.map(function(d) {return color_scale(d)}));

                var color_legend = d3.legend.color()
                .shapePadding(3)
                .scale(legend_color_scale)
                .on("cellover", function(d) {
                    var nsel = ".color:not(.color-" + d + ")";
                    var sel = ".color-" + d;
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
                });

                svg.append("g")
                .append("text")
                .attr("class", "color-legend-label")
                .attr("transform", "translate(" + dims.legend_x + "," + margin.legend_top + ")")
                .style("text-anchor", "beginning")
                .style("fill", "#000")
                .style("font-weight", "bold")
                .text(settings.col_lab);

                svg.append("g")
                .attr("class", "color-legend")
                .attr("transform", "translate(" + dims.legend_x + "," + (margin.legend_top + 8) + ")")
                .call(color_legend);
            }


            // Symbol legend
            if (settings.has_symbol_legend) {

                // Height of color legend
                var color_legend_height = color_scale.domain().length * 20 + 30;
                margin.symbol_legend_top = color_legend_height + margin.legend_top;

                var legend_symbol_domain = symbol_scale.domain().sort();
                var legend_symbol_scale = d3.scale.ordinal();
                legend_symbol_scale
                .domain(legend_symbol_domain)
                .range(legend_symbol_domain.map(function(d) {return d3.svg.symbol().type(d3.svg.symbolTypes[symbol_scale(d)])()}));

                var symbol_legend = d3.legend.symbol()
                .shapePadding(5)
                .scale(legend_symbol_scale)
                .on("cellover", function(d) {
                    var nsel = ".symbol:not(.symbol-" + d + ")";
                    var sel = ".symbol-" + d;
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
                });

                svg.append("g")
                .append("text")
                .attr("class", "symbol-legend-label")
                .attr("transform", "translate(" + dims.legend_x + "," + margin.symbol_legend_top + ")")
                .style("text-anchor", "beginning")
                .style("fill", "#000")
                .style("font-weight", "bold")
                .text(settings.symbol_lab);

                svg.append("g")
                .attr("class", "symbol-legend")
                .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.symbol_legend_top + 14) + ")")
                .call(symbol_legend);
            }

            // Size legend
            if (settings.has_size_legend) {

                // Height of color and symbol legends
                var other_legends_height = (color_scale.domain().length + symbol_scale.domain().length) * 20 + 60;
                margin.size_legend_top = other_legends_height + margin.legend_top;

                legend_size_scale = d3.scale.linear()
                .domain(size_scale.domain())
                // FIXME : find exact formula
                .range(size_scale.range().map(function(d) {return Math.sqrt(d)/1.8}));

                var size_legend = d3.legend.size()
                .shapePadding(3)
                .shape('circle')
                .scale(legend_size_scale);

                svg.append("g")
                .append("text")
                .attr("class", "size-legend-label")
                .attr("transform", "translate(" + dims.legend_x + "," + margin.size_legend_top + ")")
                .style("text-anchor", "beginning")
                .style("fill", "#000")
                .style("font-weight", "bold")
                .text(settings.size_lab);

                svg.append("g")
                .attr("class", "size-legend")
                .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.size_legend_top + 14) + ")")
                .call(size_legend);
            }


        });
    }

    // Add controls handlers for shiny
    chart.add_controls_handlers = function() {

        // Zoom reset
        d3.select("#scatterD3-resetzoom").on("click", function() {
            d3.transition().duration(750).tween("zoom", function() {
                var ix = d3.interpolate(x.domain(), [min_x - gap_x, max_x + gap_x]),
                iy = d3.interpolate(y.domain(), [min_y - gap_y, max_y + gap_y]);
                return function(t) {
                    zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
                    zoomed(reset=true);
                };
            })
        });

        // Labels size
        d3.select("#scatterD3-size").on("change", function() {
            labels_size = this.value;
            svg.selectAll(".point-label").transition().style("font-size", labels_size + "px");
        });

        // Point opacity
        d3.select("#scatterD3-opacity").on("change", function() {
            point_opacity = this.value;
            svg.selectAll(".dot").transition().style("opacity", point_opacity);
        });

        // SVG export
        d3.select("#scatterD3-download")
        .on("click", function(){
            svg
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", 1.1)
            .node().parentNode
            .innerHTML;
            var imageUrl = "data:image/octet-stream;base64,\n" + btoa(svg);
            d3.select(this)
            .attr("download", "scatterD3.svg")
            .attr("href", imageUrl);
        });
    };


    chart.resize = function() {
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
        svg.select(".pane").attr("width", dims.width).attr("height", dims.height);
        svg.select(".chart-body").attr("width", dims.width).attr("height", dims.height);
        svg.select(".x.axis").attr("transform", "translate(0," + dims.height + ")").call(xAxis);
        svg.select(".x.axis .label").attr("x", dims.width - 5);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll(".dot").attr("transform", translation);
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
        if (settings.has_color_legend) {
            svg.select(".color-legend-label")
            .attr("transform", "translate(" + dims.legend_x + "," + margin.legend_top + ")");
            svg.select(".color-legend")
            .attr("transform", "translate(" + dims.legend_x + "," + (margin.legend_top + 12) + ")");
        }
        if (settings.has_symbol_legend) {
            svg.select(".symbol-legend-label")
            .attr("transform", "translate(" + dims.legend_x + "," + margin.symbol_legend_top + ")");
            svg.select(".symbol-legend")
            .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.symbol_legend_top + 14) + ")");
        }
        if (settings.has_size_legend) {
            svg.select(".size-legend-label")
            .attr("transform", "translate(" + dims.legend_x + "," + margin.size_legend_top + ")");
            svg.select(".size-legend")
            .attr("transform", "translate(" + (dims.legend_x + 8) + "," + (margin.size_legend_top + 14) + ")");
        }


    };

    // settings getter/setter
    chart.settings = function(value) {
        if (!arguments.length) return settings;
        settings = value;
        // update dims and scales
        setup_sizes();
        setup_scales();
        return chart;
    };

    chart.width = function(value) {
        // width getter/setter
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
        d3.select(el).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "scatterD3")
        .append("style")
        .text(".scatterD3 {font: 10px sans-serif;}" +
        ".scatterD3 .axis line, .axis path { stroke: #000; fill: none; shape-rendering: CrispEdges;} " +
        ".scatterD3 .axis .tick line { stroke: #ddd;} " +
        ".scatterD3 .axis text { fill: #000;} " +
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
        return scatterD3().width(width).height(height);
    },

    resize: function(el, width, height, scatter) {

        if (width < 0) width = 0;
        if (height < 0) height = 0;
        // resize root svg element
        d3.select(el).select("svg")
        .attr("width", width)
        .attr("height", height);
        // resize chart
        scatter.width(width).height(height).resize();
    },

    renderValue: function(el, obj, scatter) {
        // convert data to d3 format
        data = HTMLWidgets.dataframeToD3(obj.data);
        // initialize chart with settings
        scatter = scatter.settings(obj.settings);
        // add controls handlers for shiny apps
        scatter.add_controls_handlers();
        // draw chart
        d3.select(el)
        .datum(data)
        .call(scatter);
    }

});
