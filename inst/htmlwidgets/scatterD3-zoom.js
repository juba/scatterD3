
// Init and returns a zoom behavior
function zoom_behavior(chart) {
 
    var root = chart.svg().select(".root");
    var viewport = chart.svg().select(".viewport");

    var root_bb = root.node().getBoundingClientRect();
    var viewport_bb = viewport.node().getBoundingClientRect();

    var x0 = viewport_bb.left - root_bb.left;
    var y0 = viewport_bb.top - root_bb.top;
    var x1 = viewport_bb.right - root_bb.left;
    var y1 = viewport_bb.bottom - root_bb.top;

    // Zoom behavior
    var zoom = d3v5.zoom()
        .extent([[0, y0], [x1 - x0, y1]])
        .scaleExtent([0, 32])
        .on("zoom", function() { zoomed(chart); });

    return zoom;
}

// Zoom function
function zoomed(chart) {

    var root = chart.svg().select(".root");
    
    if (!chart.settings().x_categorical) {
        chart.scales().x = d3v5.event.transform.rescaleX(chart.scales().x_orig);
        chart.scales().xAxis = chart.scales().xAxis.scale(chart.scales().x);
        root.select(".x.axis").call(chart.scales().xAxis);
    }
    if (!chart.settings().y_categorical) {
        chart.scales().y = d3v5.event.transform.rescaleY(chart.scales().y_orig);
        chart.scales().yAxis = chart.scales().yAxis.scale(chart.scales().y);
        root.select(".y.axis").call(chart.scales().yAxis);
    }
    
    var chart_body = chart.svg().select(".chart-body");
    
    chart_body.selectAll(".dot, .point-label")
        .attr("transform", function (d) { return translation(d, chart.scales()); });
    chart_body.selectAll(".line").call(function (sel) {
        line_formatting(sel, chart.dims(), chart.settings(), chart.scales());
    });
    chart_body.selectAll(".arrow").call(function (sel) { draw_arrow(sel, chart.scales()); });
    chart_body.selectAll(".ellipse").call(function (sel) { ellipse_formatting(sel, chart.settings(), chart.scales()); });
    chart.svg().select(".unit-circle").call(function (sel) { add_unit_circle(sel, chart.scales()); });
    
    if (typeof chart.settings().zoom_callback === 'function') {
        chart.settings().zoom_callback(chart.scales().x.domain()[0], chart.scales().x.domain()[1], 
            chart.scales().y.domain()[0], chart.scales().y.domain()[1]);
    }
    
}

// Reset zoom function
function reset_zoom(chart) {
    var root = chart.svg().select(".root");
    root.transition().duration(750).call(chart.zoom().transform, d3v5.zoomIdentity);
}
