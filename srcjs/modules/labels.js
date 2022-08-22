import { dot_size } from "./dots";
import * as label_lines from "./label-lines";
import { labeler } from "../plugins/labeler";
import * as utils from "./utils";
import * as d3 from "d3";

export function create(chart, duration) {

    if (!chart.settings().has_labels) return;

    var labels = chart.svg().select(".chart-body")
        .selectAll(".point-label")
        .data(chart.data(), utils.key);

    labels.enter()
        .append("text")
        .call(init)
        .call(format, chart)
        .call(drag_behavior(chart, duration));

    // Automatic label placement
    labels_placement(chart, duration);

}


export function update(chart, duration) {

    if (!chart.settings().has_labels) return;
    if (chart.settings().positions_changed) labels_placement(chart, duration);

    const data = chart.data().filter(d => (d.lab !== "" && d.lab !== null))

    const labels = chart.svg().select(".chart-body")
        .selectAll(".point-label")
        .data(data, utils.key);

    labels.enter()
        .append("text")
        .call(init)
        .call(drag_behavior(chart, duration))
        .merge(labels)
        .transition().duration(duration)
        .call(format, chart);

    labels.exit()
        .each(function (d) {
            chart.svg()
                .select(".label-line-" + utils.css_clean(utils.key(d)))
                .remove();
        })
        .transition().duration(duration)
        .attr("transform", "translate(0,0)")
        .remove();

    if (chart.settings().has_labels_changed) {
        var label_export = d3.select("#scatterD3-menu-" + chart.settings().html_id)
            .select(".label-export");
        label_export.style("display", chart.settings().has_labels ? "block" : "none");
    }

}


// Initial text label attributes
function init(selection) {

    selection
        .attr("text-anchor", "middle");
}

// Compute default vertical offset for labels
export function default_label_dy(d, chart) {
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
    // From chart.positions()
    const position = chart.positions().filter(p => utils.key(p) == utils.key(d))
    if (position.length > 0) {
        return position[0].lab_dx;
    }
    // From labels_positions argument
    if (chart.settings().labels_positions && chart.settings().labels_positions != "auto") {
        return chart.scales().x(chart.settings().labels_positions[i].lab_x) - chart.scales().x(d.x);
    }
    // Default
    return (0);
}

// Compute label y position
function get_label_dy(d, i, chart) {
    // Manually defined
    if (d.lab_dy !== undefined) return (d.lab_dy);
    // From chart.positions()
    const position = chart.positions().filter(p => utils.key(p) == utils.key(d))
    if (position.length > 0) {
        return position[0].lab_dy;
    }
    // From labels_positions argument
    if (chart.settings().labels_positions && chart.settings().labels_positions != "auto") {
        var dy = chart.scales().y(chart.settings().labels_positions[i].lab_y) - chart.scales().y(d.y);
        return dy;
    }
    // Default
    return default_label_dy(d, chart);
}

// Apply format to text label
function format(selection, chart) {

    selection
        .filter(d => (d.lab !== "" && d.lab !== null))
        .text(d => (d.lab))
        .style("font-size", chart.settings().labels_size + "px")
        .attr("class", (d, i) =>
            (`point-label color color-c${utils.css_clean(d.col_var)} symbol symbol-c${utils.css_clean(d.symbol_var)}`)
        )
        .attr("transform", d => (utils.translation(d, chart.scales())))
        .style("fill", d => (chart.scales().color(d.col_var)))
        .attr("dx", (d, i) => (get_label_dx(d, i, chart) + "px"))
        .attr("dy", (d, i) => (get_label_dy(d, i, chart) + "px"))

}



// Compute automatic label placement
function labels_placement(chart, duration) {

    if (chart.settings().labels_positions != "auto") return;

    var label_array = [];
    var anchor_array = [];
    var nsweeps = 200;
    var index = 0;

    var labels = chart.svg().selectAll(".point-label");

    labels = labels.filter(d => (d.lab !== "" && d.lab !== null));

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

    labeler()
        .label(label_array)
        .anchor(anchor_array)
        .width(chart.dims().width)
        .height(chart.dims().height)
        .start(nsweeps);

    let positions = chart.positions();
    labels.data().forEach(function (d, i) {
        d.lab_dx = label_array[i].x - chart.scales().x(d.x);
        d.lab_dy = label_array[i].y - chart.scales().y(d.y);
        positions = positions.filter(p => utils.key(p) != utils.key(d))
        positions.push({ lab_dx: d.lab_dx, lab_dy: d.lab_dy, key_var: d.key_var })
    })
    chart.positions(positions);

    labels
        .transition().duration(duration)
        .call(format, chart)

    labels.call(label_lines.display, chart, duration)
}


// Drag behavior
function drag_behavior(chart, duration) {

    var scales = chart.scales();
    var labels = chart.svg().selectAll(".point-label");

    // Text labels dragging function
    var drag = d3.drag()
        .subject((event, d, i) => {
            var dx = get_label_dx(d, i, chart);
            var dy = get_label_dy(d, i, chart);
            return { x: scales.x(d.x) + dx, y: scales.y(d.y) + dy };
        })
        .on('start', (event, d) => {
            if (!event.sourceEvent.shiftKey) {
                chart.dragging(true);
                var label = labels.filter(p => p === d);
                label.style('fill', '#000');
            }
        })
        .on('drag', (event, d) => {
            if (chart.dragging()) {
                var label = labels.filter(p => p === d);
                var dx = event.x - scales.x(d.x);
                var dy = event.y - scales.y(d.y);
                label.attr('dx', dx + "px")
                    .attr('dy', dy + "px");
                d.lab_dx = dx;
                d.lab_dy = dy;
                label.call(label_lines.display, chart);
                let positions = chart.positions();
                positions = positions.filter(p => utils.key(p) != utils.key(d))
                positions.push({ lab_dx: d.lab_dx, lab_dy: d.lab_dy, key_var: d.key_var })
                chart.positions(positions)
            }
        })
        .on('end', (event, d) => {
            if (chart.dragging()) {
                var label = labels.filter(p => p === d);
                label.style('fill', chart.scales().color(d.col_var));
                label.call(label_lines.display, chart);
                chart.dragging(false);
            }
        });

    return drag;

}
