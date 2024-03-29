import * as arrows from "./arrows";
import * as axes from "./axes";
import * as ellipses from "./ellipses";
import * as lines from "./lines";
import * as utils from "./utils";
import * as d3 from "d3";

// Init and returns a zoom behavior
export function behavior(chart) {

    var root = chart.svg().select(".root");
    var viewport = chart.svg().select(".viewport");

    var root_bb = root.node().getBoundingClientRect();
    var viewport_bb = viewport.node().getBoundingClientRect();

    var x0 = viewport_bb.left - root_bb.left;
    var y0 = viewport_bb.top - root_bb.top;
    var x1 = viewport_bb.right - root_bb.left;
    var y1 = viewport_bb.bottom - root_bb.top;

    // Zoom behavior
    var zoom = d3.zoom()
        .extent([[0, y0], [x1 - x0, y1]])
        .scaleExtent([0, 32])
        .on("zoom", (event) => zoomed(event, chart));

    return zoom;
}

// Zoom function
function zoomed(event, chart) {

    var root = chart.svg().select(".root");

    if (!chart.settings().x_categorical) {
        chart.scales().x = event.transform.rescaleX(chart.scales().x_orig);
        chart.scales().xAxis = chart.scales().xAxis.scale(chart.scales().x);
        root.select(".x.axis").call(chart.scales().xAxis);
    }
    if (!chart.settings().y_categorical) {
        chart.scales().y = event.transform.rescaleY(chart.scales().y_orig);
        chart.scales().yAxis = chart.scales().yAxis.scale(chart.scales().y);
        root.select(".y.axis").call(chart.scales().yAxis);
    }

    var chart_body = chart.svg().select(".chart-body");

    chart_body.selectAll(".dot, .point-label, .point-label-line")
        .attr("transform", d => ( utils.translation(d, chart.scales()) ));
    chart_body.selectAll(".line").call(lines.format, chart)
    chart_body.selectAll(".arrow").call(arrows.draw, chart);
    chart_body.selectAll(".ellipse").call(ellipses.format, chart);
    chart.svg().select(".unit-circle").call(axes.unit_circle_format, chart);

    if (typeof chart.settings().zoom_callback === 'function') {
        chart.settings().zoom_callback(chart.scales().x.domain()[0], chart.scales().x.domain()[1],
            chart.scales().y.domain()[0], chart.scales().y.domain()[1]);
    }

}

// Reset zoom function
export function reset(chart) {
    var root = chart.svg().select(".root");
    root.transition().duration(1000)
        .call(chart.zoom().transform, d3.zoomIdentity);
}

// Update zoom function
export function update(chart) {
    var root = chart.svg().select(".root");
    root.select(".x.axis")
        .transition().duration(1000)
        .call(chart.scales().xAxis);
    root.select(".y.axis")
        .transition().duration(1000)
        .call(chart.scales().yAxis)
        .on("end", function() {
            root.call(chart.zoom().transform, d3.zoomIdentity);
        });
}


// Zoom on
export function on(chart, duration) {

    if (chart.settings().zoom_on === null) return;

    var root = chart.svg().select(".root");
    var curZoom = d3.zoomTransform(root.node());
    var zoom_x = chart.scales().x(chart.settings().zoom_on[0]);
    var zoom_y = chart.scales().y(chart.settings().zoom_on[1]);
    var zoom_dx = (chart.dims().width / 2 - zoom_x) / curZoom.k;
    var zoom_dy = (chart.dims().height / 2 - zoom_y) / curZoom.k;
    root.transition().duration(duration)
        .call(chart.zoom().translateBy, zoom_dx, zoom_dy)
        .on("end", function() {
        if (chart.settings().zoom_on_level != curZoom.k) {
            root.transition().duration(duration)
                .call(chart.zoom().scaleTo, chart.settings().zoom_on_level)
        }
    })

}
