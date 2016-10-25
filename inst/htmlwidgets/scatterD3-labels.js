
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

// Apply format to text label
function label_formatting (selection, settings, scales) {
    var sel = selection
        .text(function(d) {return(d.lab);})
        .style("font-size", settings.labels_size + "px")
        .attr("class", function(d,i) { return "point-label color color-c" + css_clean(d.col_var) + " symbol symbol-c" + css_clean(d.symbol_var); })
        .attr("transform", function(d) { return translation(d, scales); })
        .style("fill", function(d) { return scales.color(d.col_var); })
        .attr("dx", function(d) {
	    if (d.lab_dx === undefined) return("0px");
	    else return(d.lab_dx + "px");
        })
        .attr("dy", function(d) {
	    if (d.lab_dy !== undefined) return(d.lab_dy + "px");
	    var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
	    return default_label_dy(size, d.y, d.type_var, settings) + "px";
        });
    return sel;
}
