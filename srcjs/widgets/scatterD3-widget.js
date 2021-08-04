import 'widgets';
import * as d3 from "d3";
import { scatterD3 } from '../modules/scatterD3';
import "../css/scatterD3.css";

// Make libraries available to be used in JS()
window.d3 = d3;

HTMLWidgets.widget({

    name: 'scatterD3',

    type: 'output',

    factory: function (el, width, height) {

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
        let tooltip = d3.select(".scatterD3-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body")
                .append("div")
                .style("visibility", "hidden")
                .attr("class", "scatterD3-tooltip");
        }

        // Create title and subtitle div
        let caption = d3.select(el).select(".scatterD3-caption");
        if (caption.empty()) {
            caption = d3.select(el).append("div")
                .attr("class", "scatterD3-caption");
        }

        // Create menu div
        let menu = d3.select(el).select(".scatterD3-menu");
        if (menu.empty()) {
            menu = d3.select(el).append("ul")
                .attr("class", "scatterD3-menu");
        }

        // Create scatterD3 instance
        let scatter = scatterD3().width(width).height(height).svg(svg);

        return ({
            resize: function (width, height) {

                if (width < 0) width = 0;
                if (height < 0) height = 0;
                // resize root svg element
                const svg = d3.select(el).select("svg");
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
                const svg = d3.select(el).select("svg")
                const menu = d3.select(el).select(".scatterD3-menu");
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
                    d3.select(el).call(scatter);
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
                            ok(x).every(key => object_equal(x[key], y[key]))
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
                    if (typeof (scatter.settings().sizes) === "object" && typeof (obj.settings.sizes) === "object") {
                        obj.settings.sizes_changed = !object_equal(scatter.settings().sizes, obj.settings.sizes);
                    } else {
                        obj.settings.sizes_changed = scatter.settings().sizes != obj.settings.sizes;
                    }
                    if (typeof (scatter.settings().opacities) === "object" && typeof (obj.settings.opacities) === "object") {
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

                if (typeof (obj.settings.init_callback) === "function") {
                    obj.settings.init_callback.call(scatter);
                }

            },

            s: scatter
        });
    }
});
