


function labels_create(chart) {

    if (!chart.settings().has_labels) return;

    var labels = chart.svg().select(".chart-body")
        .selectAll(".point-label")
        .data(chart.data(), key);
    
    labels.enter()
        .append("text")
	.call(label_init)
        .call(label_formatting, chart)
        .call(drag_behavior(chart));

    // Automatic label placement
    labels_placement(chart);

}


function labels_update(chart) {

    function endall(transition, callback) {
        if (typeof callback !== "function") throw new Error("Wrong callback in endall");
        if (transition.size() === 0) { callback() }
        var n = 0;
        transition
            .each(function() { ++n; })
            .on("end", function() { if (!--n) callback.apply(this, arguments); });
      }

    if (!chart.settings().has_labels) return;

    var labels = chart.svg().select(".chart-body")
        .selectAll(".point-label")
        .data(chart.data(), key);
    labels.enter()
        .append("text")
        .call(label_init)
        .call(drag_behavior(chart))
        .merge(labels)
        .transition().duration(1100)
        .call(label_formatting, chart)
        .call(endall, function() { labels_placement(chart); });

    labels.exit()
        .each(function(d) {
            chart.svg()
                .select(".label-line-" + css_clean(key(d)))
                .remove();
        })
        .transition().duration(1000)
        .attr("transform", "translate(0,0)")
        .remove();

    if (chart.settings().has_labels_changed) {
        var label_export = d3v5.select("#scatterD3-menu-" + chart.settings().html_id)
            .select(".label-export");
        label_export.style("display", chart.settings().has_labels ? "block" : "none");
    }

}


// Initial text label attributes
function label_init(selection) {

    selection
        .attr("text-anchor", "middle");
}

// Compute default vertical offset for labels
function default_label_dy(d, chart) {
    var size = (d.size_var === undefined) ? chart.settings().point_size : chart.scales().size(d.size_var);
    if (d.y < 0 && d.type_var !== undefined && d.type_var == "arrow") {
        return (Math.sqrt(size) / 2) + chart.settings().labels_size + 2;
    }
    else {
        return (-Math.sqrt(size) / 2) - 6;
    }
}

// Compute label x position
function get_label_dx(d, i, chart) {
    // Manually defined
    if (d.lab_dx !== undefined) return (d.lab_dx);
    // From labels_positions argument
    if (chart.settings().labels_positions && chart.settings().labels_positions != "auto") {
        var dx = chart.scales().x(chart.settings().labels_positions[i].lab_x) - chart.scales().x(d.x);
        return dx;
    }
    // Default
    return (0);
}

// Compute label y position
function get_label_dy(d, i, chart) {
    // Manually defined
    if (d.lab_dy !== undefined) return (d.lab_dy);
    // From labels_positions argument
    if (chart.settings().labels_positions && chart.settings().labels_positions != "auto") {
        var dy = chart.scales().y(chart.settings().labels_positions[i].lab_y) - chart.scales().y(d.y);
        return dy;
    }
    // Default
    return default_label_dy(d, chart);
}

// Apply format to text label
function label_formatting(selection, chart) {

    selection
	.filter(function(d) { return d.lab !== "" && d.lab !== null; })
        .text(function (d) { return (d.lab); })
        .style("font-size", chart.settings().labels_size + "px")
        .attr("class", function (d, i) {
            return "point-label color color-c" + css_clean(d.col_var) + " symbol symbol-c" + css_clean(d.symbol_var);
        })
        .attr("transform", function (d) { return translation(d, chart.scales()); })
        .style("fill", function (d) { return chart.scales().color(d.col_var); })
        .attr("dx", function(d, i) { return get_label_dx(d, i, chart) + "px"; })
        .attr("dy", function(d, i) { return get_label_dy(d, i, chart) + "px"; })
        .each(function(d, i) {
            var label = d3v5.select(this);
            var dx = get_label_dx(d, i, chart);
            var dy = get_label_dy(d, i, chart);
            label.call(label_line_formatting, d, dx, dy, chart);
        })
}


// Compute end of label line coordinates and distance with point
function label_line_coordinates(label, x_orig, y_orig, x, y) {
    
    var label_bb = label.node().getBBox();
    var bb = {left: x - label_bb.width / 2,
              right: x + label_bb.width / 2,
              top: y - 3 * label_bb.height / 4,
              bottom: y + label_bb.height / 4,
              middle: y - label_bb.height / 4};
    var coord = {};

    if (bb.left > x_orig + 4) {
        coord.x = bb.left - 5;
        coord.y = bb.middle;
    } else if (bb.right < x_orig - 4) {
        coord.x = bb.right + 5;
        coord.y = bb.middle;
    } else {
        coord.x = x;
        if (y > y_orig) {
            coord.y = bb.top;
        } else {
            coord.y = bb.bottom;
        }
    }

    coord.dist = Math.sqrt(Math.pow(coord.x - x_orig, 2) + Math.pow(coord.y - y_orig, 2));

    // No line if label is just around point
    if (bb.bottom  >= y_orig - 10 && bb.top <= y_orig + 10 &&
        bb.left <= x_orig + 4 && bb.right >= x_orig - 4) {
        coord.dist = 0;
    }

    return(coord);

}

// Format line between point and label
function label_line_formatting(selection, d, dx, dy, chart) {

    var x = chart.scales().x(d.x);
    var y = chart.scales().y(d.y);
    var coord = label_line_coordinates(selection, x, y, x + dx, y + dy);
    var x2 = coord.x - x;
    var y2 = coord.y - y;
    var line = chart.svg().select(".label-line-" + css_clean(key(d)));
    // Force negative gap for labels below arrows
    var gap0 = -Math.abs(default_label_dy(d, chart));

    if (coord.dist > 15 && line.empty()) {
        line = chart.svg().select(".chart-body")
            .append("svg:line")
            .lower()
            .datum(d)
            .attr("transform", translation(d, chart.scales()))
            .attr("class", function (d, i) {
                return "point-label-line label-line-" + css_clean(key(d)) + " color color-c" + css_clean(d.col_var) + " symbol symbol-c" + css_clean(d.symbol_var);
            })
    }
    if (coord.dist > 15) {
        line.attr("x1", - x2 * gap0 / coord.dist).attr("x2", x2)
            .attr("y1", - y2 * gap0 / coord.dist).attr("y2", y2)
            .style("stroke", chart.scales().color(d.col_var));
    }
    if (coord.dist <= 15 && !line.empty()) {
        line.remove();
    }
}


// Compute automatic label placement
function labels_placement(chart) {

    if (chart.settings().labels_positions != "auto") return;

    var label_array = [];
    var anchor_array = [];
    var nsweeps = 200;
    var index = 0;

    var labels = chart.svg().selectAll(".point-label");

    labels = labels.filter(function(d) { return d.lab !== "" && d.lab !== null;});

    labels.each(function (d) {
        var bb = this.getBBox();
        label_array[index] = {};
        label_array[index].width = bb.width;
        label_array[index].height = bb.height;
        label_array[index].x = chart.scales().x(d.x);
        label_array[index].y = chart.scales().y(d.y);
        label_array[index].name = d.lab;
        anchor_array[index] = {};
        anchor_array[index].x = chart.scales().x(d.x);
        anchor_array[index].y = chart.scales().y(d.y);
        anchor_array[index].r = Math.sqrt(dot_size(d, chart));
        index += 1;
    });

    d3v5.labeler()
        .label(label_array)
        .anchor(anchor_array)
        .width(chart.dims().width)
        .height(chart.dims().height)
        .start(nsweeps);

    labels.data().forEach(function (d, i) {
        d.lab_dx = label_array[i].x - chart.scales().x(d.x);
        d.lab_dy = label_array[i].y - chart.scales().y(d.y);
    })

    labels
        .transition().duration(1000)
        .call(label_formatting, chart);

}


// Drag behavior
function drag_behavior(chart) {

    var scales = chart.scales();

    // Text labels dragging function
    var drag = d3v5.drag()
        .subject(function(d, i) {
            var dx = get_label_dx(d, i, chart);
            var dy = get_label_dy(d, i, chart);
            return { x: scales.x(d.x) + dx, y: scales.y(d.y) + dy };
        })
        .on('start', function (d) {
            if (!d3v5.event.sourceEvent.shiftKey) {
                dragging = true;
                var label = d3v5.select(this);
                label.style('fill', '#000');
                var dx = d3v5.event.x - scales.x(d.x);
                var dy = d3v5.event.y - scales.y(d.y);
                label.call(label_line_formatting, d, dx, dy, chart);
            }
        })
        .on('drag', function(d) {
            if (dragging) {
                var label = d3v5.select(this);
                var dx = d3v5.event.x - scales.x(d.x);
                var dy = d3v5.event.y - scales.y(d.y);
                label.attr('dx', dx + "px")
                     .attr('dy', dy + "px");
                label.call(label_line_formatting, d, dx, dy, chart);
                d.lab_dx = dx;
                d.lab_dy = dy;
            }
        })
        .on('end', function(d) {
            if (dragging) {
                d3v5.select(this).style('fill', chart.scales().color(d.col_var));
                d3v5.select(this).call(label_line_formatting, d, d.lab_dx, d.lab_dy, chart);
                dragging = false;
            }
        });

    return drag;

}
