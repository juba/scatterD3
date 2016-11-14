
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
    if (settings.labels_positions) {
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
    if (settings.labels_positions) {
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
