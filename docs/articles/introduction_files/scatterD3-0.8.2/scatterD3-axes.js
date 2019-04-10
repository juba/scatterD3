// Create and draw x and y axes
function add_axes(selection, chart) {

    var dims = chart.dims();
    var settings = chart.settings();
    var scales = chart.scales();

    // x axis
    selection.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dims.height + ")")
        .style("font-size", settings.axes_font_size)
        .call(scales.xAxis);

    // y axis
    selection.append("g")
        .attr("class", "y axis")
        .style("font-size", settings.axes_font_size)
        .call(scales.yAxis);

    // x axis label
    selection.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")")
        .style("text-anchor", "end")
        .style("font-size", settings.axes_font_size)
        .text(settings.xlab);

    // y axis label
    selection.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "translate(5,6) rotate(-90)")
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", settings.axes_font_size)
        .text(settings.ylab);

}


function unit_circle_create(chart) {
    if (!chart.settings().unit_circle) return;
    chart.svg().select(".chart-body")
        .append('svg:ellipse')
        .attr('class', 'unit-circle')
        .call(unit_circle_formatting, chart);
}

function unit_circle_update(chart) {
    if (!chart.settings().unit_circle) return;
    chart.svg().select(".chart-body")
        .select(".unit-circle")
        .transition().duration(1000)
        .call(unit_circle_formatting, chart);
}


// Add unit circle
function unit_circle_formatting(selection, chart) {

    var scales = chart.scales();

    selection
        .attr('cx', scales.x(0))
        .attr('cy', scales.y(0))
        .attr('rx', scales.x(1) - scales.x(0))
        .attr('ry', scales.y(0) - scales.y(1))
        .style("stroke", "#888")
        .style("fill", "none")
        .style("opacity", "1");
}
