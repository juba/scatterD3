import * as utils from "./utils";
import { default_label_dy } from "./labels";

export function update(chart, duration) {

    if (!chart.settings().has_labels) return;

    const labels_lines = chart.svg().select(".chart-body")
        .selectAll(".point-label-line")
        .data(chart.data().label_lines, utils.key);

    let t = labels_lines.enter()
        .append("svg:line")
        .lower()
        .merge(labels_lines)

    if (!chart.dragging()) t = t.transition().duration(duration)

    t.call(format, chart);

    labels_lines.exit()
        .remove();

}

// Format line between point and label
function format(selection, chart) {

    selection
        .attr("transform", d => ( utils.translation(d, chart.scales()) ))
        .attr("class", (d, i) => (
            `point-label-line label-line-${utils.css_clean(utils.key(d))} color color-c${utils.css_clean(d.col_var)} symbol symbol-c${utils.css_clean(d.symbol_var)}`
        ))
        .attr("x1", d => (d.x1))
        .attr("x2", d => (d.x2))
        .attr("y1", d => (d.y1))
        .attr("y2", d => (d.y2))
        .style("stroke", d => chart.scales().color(d.col_var));
}

// Compute end of label line coordinates and distance with point
function coordinates(label, x_orig, y_orig, x, y) {

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
export function display(selection, chart, duration) {

    const d = selection.datum()
    const x = chart.scales().x(d.x);
    const y = chart.scales().y(d.y);
    const coord = coordinates(selection, x, y, x + d.lab_dx, y + d.lab_dy);


    // Force negative gap for labels below arrows
    var gap0 = -Math.abs(default_label_dy(d, chart));

    const x2 = coord.x - x;
    const y2 = coord.y - y;
    const x1 = - x2 * gap0 / coord.dist;
    const y1 = - y2 * gap0 / coord.dist;

    chart.data().label_lines = chart.data().label_lines.filter(l => ( utils.key(l) != utils.key(d) ));
    if (coord.dist > 15) {
        chart.data().label_lines.push(
            {
                x1: x1, y1: y1, x2: x2, y2: y2, x: d.x, y: d.y,
                col_var: d.col_var, key_var: d.key_var, symbol_var: d.symbol_var
            }
        )
    }

    update(chart, duration);
}
