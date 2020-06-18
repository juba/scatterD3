// Export to SVG function
function export_svg(sel, chart) {
    
    var svg_content = chart.svg()
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("version", 1.1)
        .node().parentNode.innerHTML;
    
        // Dirty dirty dirty...
    svg_content = svg_content.replace(/<g class="gear-menu[\s\S]*?<\/g>/, '');
    svg_content = svg_content.replace(/<ul class="scatterD3-menu[\s\S]*?<\/ul>/, '');
    svg_content = svg_content.replace(/<g class="caption-icon[\s\S]*?<\/g>/, '');
    svg_content = svg_content.replace(/<div class="scatterD3-caption[\s\S]*?<\/div>/, '');
    
    var image_data = "data:image/octet-stream;base64," + window.btoa(unescape(encodeURIComponent(svg_content)));

    d3v5.select(sel)
        .attr("download", chart.settings().html_id + ".svg")
        .attr("href", image_data);
}

// Function to export custom labels position to CSV file
function export_labels_position(sel, chart) {

    var scales = chart.scales();
    var settings = chart.settings();

    var lines_data = ["lab,lab_x,lab_y"];
    
    chart.data().forEach(function(d, index){
        var labx = d.x;
        if (d.lab_dx !== undefined) {
	    labx = d.x + scales.x.invert(d.lab_dx) - scales.x.domain()[0];
        }
        var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
        var offset_y = (-Math.sqrt(size) / 2) - 6;
        if (d.lab_dy !== undefined) {
	    offset_y = d.lab_dy;
        }
        var laby = d.y + scales.y.invert(offset_y) - scales.y.domain()[1];
        var this_line = d.lab + "," + labx + "," + laby;
        lines_data.push(this_line);
    });

    var csv_content = "data:text/csv;base64," + btoa(lines_data.join("\n"));
    
    d3v5.select(sel)
        .attr("download", settings.html_id + "_labels.csv")
        .attr("href", encodeURI(csv_content));
}
