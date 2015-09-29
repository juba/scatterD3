var scatterD3_store = {};

(function() {

    // Widget global variables
    var data, settings;
    var dims = {};

    // First setup : initialization
    function global_setup(obj, init) {

        // data
        data = obj.data;
        data = HTMLWidgets.dataframeToD3(data);

        // settings
        settings = obj.settings;
        settings.has_color_legend = !(data[0].col_var === undefined);
        settings.has_symbol_legend = !(data[0].symbol_var === undefined);
        settings.has_legend = settings.has_color_legend || settings.has_symbol_legend;
        settings.has_labels = !(data[0].lab === undefined);
        settings.has_tooltips = obj.settings.tooltips;
        settings.has_custom_tooltips = !(data[0].tooltip_text === undefined);

        // Store settings in global store in order
        // for every widget on the page to be able to
        // get them
        // FIX : I know, it's ugly
        scatterD3_store[settings.html_id] = {};
        scatterD3_store[settings.html_id].has_labels = settings.has_labels;
        scatterD3_store[settings.html_id].has_color_legend = settings.has_color_legend;
        scatterD3_store[settings.html_id].has_symbol_legend = settings.has_symbol_legend;
        scatterD3_store[settings.html_id].xlab = settings.xlab;
        scatterD3_store[settings.html_id].ylab = settings.ylab;
        scatterD3_store[settings.html_id].col_lab = settings.col_lab;
        scatterD3_store[settings.html_id].symbol_lab = settings.symbol_lab;

        // Create tooltip content function
        if (settings.has_tooltips) {
            if (settings.has_custom_tooltips) {
              scatterD3_store[settings.html_id].tooltip_func = function(d, html_id) {
                return d.tooltip_text;
              }
            }
            else {
                scatterD3_store[settings.html_id].tooltip_func = function(d, html_id) {
                    var text = Array();
                    if (scatterD3_store[settings.html_id].has_labels) text.push("<b>"+d.lab+"</b>");
                    text.push("<b>"+scatterD3_store[settings.html_id].xlab+":</b> "+d.x.toFixed(3));
                    text.push("<b>"+scatterD3_store[settings.html_id].ylab+":</b> "+d.y.toFixed(3));
                    if (scatterD3_store[settings.html_id].has_color_legend) text.push("<b>"+scatterD3_store[settings.html_id].col_lab+":</b> "+d.col_var);
                    if (scatterD3_store[settings.html_id].has_symbol_legend) text.push("<b>"+scatterD3_store[settings.html_id].symbol_lab+":</b> "+d.symbol_var);
                    return text.join("<br />");
                }
            };
        }
    }


    // Figure size
    function size_setup(init_width, init_height) {

        dims.margin = {top: 5, right: 10, bottom: 20, left: 50};
        dims.legend_width = 0;
        if (settings.has_legend) dims.legend_width = 150;

        dims.width = init_width - dims.legend_width;
        dims.height = init_height;

        // Fixed ratio
        if (settings.fixed) {
            dims.height = Math.min(dims.height, dims.width);
            dims.width = dims.height;
        }

        dims.height = dims.height - dims.margin.top - dims.margin.bottom;
        dims.width = dims.width - dims.margin.left - dims.margin.right;
        dims.total_width = dims.width + dims.margin.left + dims.margin.right + dims.legend_width;
        dims.total_height = dims.height + dims.margin.top + dims.margin.bottom;
    }

    // Main drawing function
    function draw(el) {

        var min_x, min_y, max_x, max_y, gap_x, gap_y;
        var x, y, color_scale, symbol_scale, xAxis, yAxis, zoom;
        var svg;

        // Drawing init
        function init_draw() {

            // Tooltip div
            if (settings.has_tooltips) {
                var tooltip = d3.select(".scatterD3-tooltip");
                if (tooltip.empty()) {
                    tooltip = d3.select("body")
                    .append("div")
                    .style("visibility", "hidden")
                    .attr("class", "scatterD3-tooltip");
                }
            }

            // recreate SVG root element
            d3.select(el).select("svg").remove();

            svg = d3.select(el).append("svg")
            .attr("class", "scatterD3")
            .attr("id", settings.html_id)
            .attr("width", dims.total_width)
            .attr("height", dims.total_height);

            css = svg.append("style")
            .text(".scatterD3 {font: 10px sans-serif;}" +
            ".scatterD3 .axis line, .axis path { stroke: #000; fill: none; shape-rendering: CrispEdges;} " +
            ".scatterD3 .axis .tick line { stroke: #ddd;} " +
            ".scatterD3 .axis text { fill: #000;} " +
            ".scatterD3 .zeroline { stroke-width: 1; stroke: #444; stroke-dasharray: 5,5;} "
        );

        // scales and zomm
        x = d3.scale.linear().range([0, dims.width]);
        y = d3.scale.linear().range([dims.height, 0]);

        color_scale = d3.scale.category10();

        symbol_scale = d3.scale.ordinal().range(d3.range(d3.svg.symbolTypes.length));

        zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([1, 32])
        .on("zoom", zoomed);

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

        x.domain([min_x - gap_x, max_x + gap_x]);
        y.domain([min_y - gap_y, max_y + gap_y]);
        zoom.x(x);
        zoom.y(y);

    }

    // Zoom function
    function zoomed(reset) {

        if (!reset) {
            var t = d3.event.translate;
            var s = d3.event.scale;
            zscale = s;
            t[0] = Math.min(
                (dims.width/dims.height)  * (s - 1),
                Math.max( dims.width * (1 - s), t[0] )
            );
            t[1] = Math.min(
                (dims.width/dims.height)  * (s - 1),
                Math.max( dims.width * (1 - s), t[1] )
            );
            zoom.translate(t);
        }

        root.selectAll(".zeroline").remove();
        root.select(".x.axis").call(xAxis);
        root.select(".y.axis").call(yAxis);
        root.selectAll(".dot, .point-label").attr("transform", transform);
        add_zerolines();
    }

    // Coordinates transformation for zoom and pan
    function transform(d) {
        return "translate(" + x(d.x) + "," + y(d.y) + ")";
    }

    // Draw 0 horizontal and vertical lines
    function add_zerolines() {
        var zeroline = d3.svg.line()
        .x(function(d) {return x(d.x)})
        .y(function(d) {return y(d.y)});
        chartBody.append("path")
        .attr("class", "zeroline hline")
        .attr("d", zeroline([{x:x.domain()[0], y:0}, {x:x.domain()[1], y:0}]));
        chartBody.append("path")
        .attr("class", "zeroline vline")
        .attr("d", zeroline([{x:0, y:y.domain()[0]}, {x:0, y:y.domain()[1]}]));
    }

    // Create and draw x and y axis
    function add_axis() {

        xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-dims.height);

        yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-dims.width);

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

    // Add color legend
    function add_color_legend() {

        var color_legend_y = 20

        root.append("g")
        .append("text")
        .attr("x", dims.total_width - dims.margin.right - dims.legend_width)
        .attr("y", color_legend_y)
        .style("text-anchor", "beginning")
        .style("fill", "#000")
        .style("font-weight", "bold")
        .text(settings.col_lab);


        var color_legend = root.selectAll(".color-legend")
        .data(color_scale.domain().sort())
        .enter().append("g")
        .attr("class", "color-legend")
        .attr("transform", function(d, i) { return "translate(0," + (color_legend_y + 10 + i * 20) + ")"; });

        // Color rectangles
        color_legend.append("rect")
        .attr("x", dims.total_width - dims.margin.right - dims.legend_width )
        .attr("width", 18)
        .attr("height", 18)
        .attr("class", function(d,i) { return "colorleg color color-" + color_scale(d,i).substring(1)})
        .style("fill", color_scale)
        .on("mouseover", function(d,i) {
            var nsel = ".color:not(.color-" + color_scale(d,i).substring(1) + ")";
            var sel = ".color-" + color_scale(d,i).substring(1);
            svg.selectAll(nsel)
            .transition()
            .style("opacity", 0.2);
            svg.selectAll(sel)
            .transition()
            .style("opacity", 1);
        })
        .on("mouseout", function(d,i) {
            var sel = ".color";
            var legsel = ".colorleg, .point-label";
            svg.selectAll(sel)
            .transition()
            .style("opacity", settings.point_opacity);
            svg.selectAll(legsel)
            .transition()
            .style("opacity", 1);
        });

        // Labels
        color_legend.append("text")
        .attr("x", dims.total_width - dims.margin.right - dims.legend_width + 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "beginning")
        .style("fill", "#000")
        .attr("class", function(d,i) { return "colorleg color color-" + color_scale(d,i).substring(1)})
        .text(function(d) { return d; });
    }

    // Add symbol legend
    function add_symbol_legend() {

        // Height of color legend
        var color_legend_height = color_scale.domain().length * 20 + 30;
        var symbol_legend_y = color_legend_height + 50;

        root.append("g")
        .append("text")
        .attr("x", dims.total_width - dims.margin.right - dims.legend_width)
        .attr("y", symbol_legend_y)
        .style("text-anchor", "beginning")
        .style("fill", "#000")
        .style("font-weight", "bold")
        .text(settings.symbol_lab);

        var symbol_legend = root.selectAll(".symbol-legend")
        .data(symbol_scale.domain().sort())
        .enter().append("g")
        .attr("class", "symbol-legend")
        .attr("transform", function(d, i) { return "translate(0," + (symbol_legend_y + 10 + i * 20) + ")"; });

        var x_trans = dims.total_width - dims.margin.right - dims.legend_width + 9;
        // Symbols
        symbol_legend.append("path")
        .attr("transform","translate(" + x_trans + ",9)")
        .attr("class", function(d,i) { return "symbleg symbol symbol-" + symbol_scale(d)})
        .style("fill", "#000")
        .attr("d", d3.svg.symbol()
        .type(function(d) {return d3.svg.symbolTypes[symbol_scale(d)]})
        .size(settings.point_size))
        .on("mouseover", function(d,i) {
            var nsel = ".symbol:not(.symbol-" + symbol_scale(d) + ")";
            var sel = ".symbol-" + symbol_scale(d);
            svg.selectAll(nsel)
            .transition()
            .style("opacity", 0.2);
            svg.selectAll(sel)
            .transition()
            .style("opacity", 1);
        })
        .on("mouseout", function(d,i) {
            var sel = ".symbol";
            var legsel = ".symbleg, .point-label";
            svg.selectAll(sel)
            .transition()
            .style("opacity", settings.point_opacity);
            svg.selectAll(legsel)
            .transition()
            .style("opacity", 1);
        });

        // Labels
        symbol_legend.append("text")
        .attr("x", dims.total_width - dims.margin.right - dims.legend_width + 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "beginning")
        .style("fill", "#000")
        .attr("class", function(d,i) { return "symbleg symbol symbol-" + symbol_scale(d)})
        .text(function(d) { return d; });
    }


    init_draw();

    // Text labels dragging
    var drag = d3.behavior.drag()
    .origin(function(d) {
        dx = (d.lab_dx === undefined) ? 0 : d.lab_dx;
        dy = (d.lab_dx === undefined) ? -Math.sqrt(settings.point_size) : d.lab_dy;
        return {x:x(d.x)+dx, y:y(d.y)+dy}; })
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

        var root = svg.append("g")
        .style("fill", "#FFF")
        .attr("transform", "translate(" + dims.margin.left + "," + dims.margin.top + ")");

        // clipping rectangle
        root.append("clipPath")
        .attr('id', 'clip')
        .append('rect')
        .style("stroke-width", 0)
        .attr('width', dims.width)
        .attr('height', dims.height);

        add_axis();

        root.append("rect")
        .attr("class", "pane")
        .attr("width", dims.width)
        .attr("height", dims.height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

        var chartBody = root.append("g")
        .attr("id", "chartBody-"+settings.html_id)
        .attr("width", dims.width)
        .attr("height", dims.height)
        .attr("clip-path", "url(#clip)");

        add_zerolines();

        // Add points
        var dot = chartBody
        .selectAll(".dot")
        .data(data);

        dot.enter().append("path")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
        .attr("id", function(d,i) { return "point-id" + i;})
        .attr("class", function(d,i) { return "dot color color-" + color_scale(d.col_var).substring(1) + " symbol symbol-" + symbol_scale(d.symbol_var); })
        .style("fill", function(d) { return color_scale(d.col_var); })
        .style("opacity", settings.point_opacity)
        .attr("d", d3.svg.symbol()
        .type(function(d) {return d3.svg.symbolTypes[symbol_scale(d.symbol_var)]})
        .size(settings.point_size));

        // tooltips when hovering points
        if (settings.has_tooltips) {
            var tooltip = d3.select(".scatterD3-tooltip");
            dot.on("mouseover", function(d, i){
                var current_id = d3.select(this.parentNode).attr("id").replace("chartBody-", "");
                tooltip.style("visibility", "visible")
                .html(scatterD3_store[current_id].tooltip_func(d, current_id));
            })
            .on("mousemove", function(){
                tooltip.style("top", (event.pageY+15)+"px").style("left",(event.pageX+15)+"px");
            })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            });
        }

        // Add text labels
        if (settings.has_labels) {
            default_dy = -Math.sqrt(settings.point_size) + "px";
            default_dx = "0px";
            chartBody.selectAll(".point-label")
            .data(data)
            .enter().append("text")
            .attr("class", function(d,i) { return "point-label color color-" + color_scale(d.col_var).substring(1) + " symbol symbol-" + symbol_scale(d.symbol_var); })
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
            .style("fill", function(d) { return color_scale(d.col_var); })
            .style("font-size", settings.labels_size + "px")
            .style("opacity", settings.point_opacity)
            .attr("text-anchor", "middle")
            .attr("dx", function(d) {
                if (d.lab_dx === undefined) return(default_dx)
                else return(d.lab_dx + "px");
            })
            .attr("dy", function(d) {
                if (d.lab_dy === undefined) return(default_dy)
                else return(d.lab_dy + "py");
            })
            .text(function(d) {return(d.lab)})
            .call(drag);
        }

        if (settings.has_color_legend) { add_color_legend() };
        if (settings.has_symbol_legend) { add_symbol_legend() };


        // Reset zoom handler must be inside draw() (to fix)
        function reset_zoom() {
            d3.transition().duration(750).tween("zoom", function() {
                var ix = d3.interpolate(x.domain(), [min_x - gap_x, max_x + gap_x]),
                iy = d3.interpolate(y.domain(), [min_y - gap_y, max_y + gap_y]);
                return function(t) {
                    zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
                    zoomed(reset=true);
                };
            });
        }

        d3.select("#scatterD3-resetzoom").on("click", reset_zoom);

    }

    function add_controls_handlers() {

        d3.select("#scatterD3-size").on("change", function() {
            labels_size = this.value;
            d3.selectAll(".point-label").transition().style("font-size", labels_size + "px");
        });

        d3.select("#scatterD3-opacity").on("change", function() {
            point_opacity = this.value;
            d3.selectAll(".dot").transition().style("opacity", point_opacity);
        });

        d3.select("#scatterD3-download")
        .on("click", function(){
            var svg = d3.select("svg#"+settings.html_id)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", 1.1)
            .node().parentNode
            .innerHTML;
            var imageUrl = "data:image/octet-stream;base64,\n" + btoa(svg);
            d3.select(this)
            .attr("download", "scatterD3.svg")
            .attr("href", imageUrl);
        });
    }


    HTMLWidgets.widget({

        name: 'scatterD3',

        type: 'output',

        initialize: function(el, width, height) {
            var init = {width: width, height: height};
            return init;
        },

        resize: function(el, width, height, instance) {
            size_setup(width, height);
            draw(el);
        },

        renderValue: function(el, obj, init) {
            global_setup(obj, init);
            size_setup(init.width, init.height);
            draw(el);
            add_controls_handlers();
        }

    });

})();
