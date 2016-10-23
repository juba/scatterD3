// Clean variables levels to be valid CSS classes
function css_clean(s) {
    if (s === undefined) return "";
    return s.toString().replace(/[^\w-]/g, "_");
}

// Default translation function for points and labels
function translation(d, scales) {
     return "translate(" + scales.x(d.x) + "," + scales.y(d.y) + ")";
}

// Create tooltip content function
function tooltip_content(d, settings) {
    // no tooltips
    if (!settings.has_tooltips) return null;
    if (settings.has_custom_tooltips) {
        // custom tooltipsl
        return d.tooltip_text;
    } else {
        // default tooltips
        var text = Array();
        if (settings.has_labels) text.push("<b>"+d.lab+"</b>");
	var x_value = settings.x_categorical ? d.x : d.x.toFixed(3);
	var y_value = settings.y_categorical ? d.y : d.y.toFixed(3);
        text.push("<b>"+settings.xlab+":</b> "+ x_value);
        text.push("<b>"+settings.ylab+":</b> "+ y_value);
        if (settings.has_color_var) text.push("<b>"+settings.col_lab+":</b> "+d.col_var);
        if (settings.has_symbol_var) text.push("<b>"+settings.symbol_lab+":</b> "+d.symbol_var);
        if (settings.has_size_var) text.push("<b>"+settings.size_lab+":</b> "+d.size_var);
        if (settings.has_opacity_var) text.push("<b>"+settings.opacity_lab+":</b> "+d.opacity_var);
        return text.join("<br />");
    }
}
