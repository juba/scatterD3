// Returns dot size from associated data
function dot_size(data, settings, scales) {
    var size = settings.point_size;
    if (settings.has_size_var) { size = scales.size(data.size_var); }
    return(size);
}

// Initial dot attributes
function dot_init (selection, settings, scales) {
    // tooltips when hovering points
    var tooltip = d3.select(".scatterD3-tooltip");
    selection.on("mouseover", function(d, i){
        d3.select(this)
            .transition().duration(150)
            .attr("d", d3.symbol()
		  .type(function(d) { return d3.symbols[scales.symbol(d.symbol_var)]; })
		  .size(function(d) { return (dot_size(d, settings, scales) * settings.hover_size); })
		 )
            .style("opacity", function(d) {
		if (settings.hover_opacity !== null) {
		    return settings.hover_opacity;
		} else {
		    return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
		}
            });
	if (settings.has_url_var) {
            d3.select(this)
		.style("cursor", function(d) {
		    return (d.url_var != "" ? "pointer" : "default");
		});
	}
	if (settings.has_tooltips) {
	    tooltip.style("visibility", "visible")
		.html(tooltip_content(d, settings));
	}
    });
    selection.on("mousemove", function(){
	if (settings.has_tooltips) {
	    tooltip.style("top", (d3.event.pageY+15)+"px").style("left",(d3.event.pageX+15)+"px");
	}
    });
    selection.on("mouseout", function(){
        d3.select(this)
            .transition().duration(150)
            .attr("d", d3.symbol()
		  .type(function(d) { return d3.symbols[scales.symbol(d.symbol_var)]; })
		  .size(function(d) { return dot_size(d, settings, scales);})
		 )
            .style("opacity", function(d) {
		return(d.opacity_var === undefined ? settings.point_opacity : scales.opacity(d.opacity_var));
	    });
	if (settings.has_tooltips) {
            tooltip.style("visibility", "hidden");
	}
    });
    selection.on("click", function(d, i) {
	if (typeof settings.click_callback === 'function') {
	    settings.click_callback(settings.html_id, i + 1);
	}
	if (settings.has_url_var && d.url_var != "") {
	    var win = window.open(d.url_var, '_blank');
	    win.focus();
	}
    });
}

// Apply format to dot
function dot_formatting(selection, settings, scales) {
    var sel = selection
        .attr("transform", function(d) { return translation(d, scales); })
    // fill color
        .style("fill", function(d) { return scales.color(d.col_var); })
	.style("opacity", function(d) {
	    return d.opacity_var !== undefined ? scales.opacity(d.opacity_var) : settings.point_opacity;
	})
    // symbol and size
        .attr("d", d3.symbol()
	      .type(function(d) {return d3.symbols[scales.symbol(d.symbol_var)];})
	      .size(function(d) { return dot_size(d, settings, scales); })
	     )
        .attr("class", function(d,i) {
	    return "dot symbol symbol-c" + css_clean(d.symbol_var) + " color color-c" + css_clean(d.col_var);
        });
    return sel;
}
