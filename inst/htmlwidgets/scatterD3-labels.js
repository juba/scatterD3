
// Initial text label attributes
function label_init (selection) {
    selection
        .attr("text-anchor", "middle");
}

// Compute default vertical offset for labels
function default_label_dy(size, y, type_var,settings) {
    if (y < 0 && type_var !== undefined && type_var == "arrow") {
        return (Math.sqrt(size) / 2) + settings.labels_size + 2;
    }
    else {
        return (-Math.sqrt(size) / 2) - 6;
    }
}

// Compute label x position
function get_label_dx(d, i, settings, scales) {
    // Manually defined
    if (d.lab_dx !== undefined) return(d.lab_dx);
    // From labels_positions argument
    if (settings.labels_positions && settings.labels_positions != "auto") {
	    var dx = scales.x(settings.labels_positions[i].lab_x) - scales.x(d.x);
	    return dx;
    }
    // Default
    return("0");
}

// Compute label y position
function get_label_dy(d, i, settings, scales) {
    // Manually defined
    if (d.lab_dy !== undefined) return(d.lab_dy);
    // From labels_positions argument
    if (settings.labels_positions  && settings.labels_positions != "auto") {
	    var dy = scales.y(settings.labels_positions[i].lab_y) - scales.y(d.y);
	    return dy;
    }
    // Default
    var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
    return default_label_dy(size, d.y, d.type_var, settings);
}

// Apply format to text label
function label_formatting (selection, settings, scales) {

    var sel = selection
        .text(function(d) {return(d.lab);})
        .style("font-size", settings.labels_size + "px")
        .attr("class", function(d,i) { return "point-label color color-c" + css_clean(d.col_var) + " symbol symbol-c" + css_clean(d.symbol_var); })
        .attr("transform", function(d) { return translation(d, scales); })
        .style("fill", function(d) { return scales.color(d.col_var); })
        .attr("dx", function(d, i) {
	        return get_label_dx(d, i, settings, scales) + "px";
        })
        .attr("dy", function(d, i) {
	        return get_label_dy(d, i, settings, scales) + "px";
        });

    return sel;
}

// Compute automatic label placement
function labels_placement(selection, settings, scales, dims) {
    var label_array = [];
    var anchor_array = [];
    var nsweeps = 1000;
    var index = 0;

    selection.each(function(d) {
        label_array[index] = {};
        label_array[index].width = this.getBBox().width;
        label_array[index].height = this.getBBox().height;
        label_array[index].x = scales.x(d.x);
        label_array[index].y = scales.y(d.y);
        label_array[index].name = d.lab;
        anchor_array[index] = {};
        anchor_array[index].x = scales.x(d.x);
        anchor_array[index].y = scales.y(d.y);
        anchor_array[index].r = Math.sqrt(dot_size(d, settings, scales));
        index += 1;
    });

    d3v5.labeler()
        .label(label_array)
        .anchor(anchor_array)
        .width(dims.width)
        .height(dims.height)
        .start(nsweeps);

    return(label_array);

}
