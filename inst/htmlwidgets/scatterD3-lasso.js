// Lasso functions to execute while lassoing
var lasso_start = function(lasso) {
    lasso.items()
        .each(function(d){
	    if (d3.select(this).classed('dot')) {
                d.scatterD3_lasso_dot_stroke = d.scatterD3_lasso_dot_stroke ? d.scatterD3_lasso_dot_stroke : d3.select(this).style("stroke");
                d.scatterD3_lasso_dot_fill = d.scatterD3_lasso_dot_fill ? d.scatterD3_lasso_dot_fill : d3.select(this).style("fill");
                d.scatterD3_lasso_dot_opacity = d.scatterD3_lasso_dot_opacity ? d.scatterD3_lasso_dot_opacity : d3.select(this).style("opacity");
	    }
	    if (d3.select(this).classed('arrow')) {
                d.scatterD3_lasso_arrow_stroke = d.scatterD3_lasso_arrow_stroke ? d.scatterD3_lasso_arrow_stroke : d3.select(this).style("stroke");
                d.scatterD3_lasso_arrow_fill = d.scatterD3_lasso_arrow_fill ? d.scatterD3_lasso_arrow_fill : d3.select(this).style("fill");
                d.scatterD3_lasso_arrow_opacity = d.scatterD3_lasso_arrow_opacity ? d.scatterD3_lasso_arrow_opacity : d3.select(this).style("opacity");
	    }
	    if (d3.select(this).classed('point-label')) {
                d.scatterD3_lasso_text_stroke = d.scatterD3_lasso_text_stroke ? d.scatterD3_lasso_text_stroke : d3.select(this).style("stroke");
                d.scatterD3_lasso_text_fill = d.scatterD3_lasso_text_fill ? d.scatterD3_lasso_text_fill : d3.select(this).style("fill");
                d.scatterD3_lasso_text_opacity = d.scatterD3_lasso_text_opacity ? d.scatterD3_lasso_text_opacity : d3.select(this).style("opacity");
	    }
        })
	    .style("fill", null) // clear all of the fills
        .style("opacity", null) // clear all of the opacities
        .style("stroke", null) // clear all of the strokes
        .classed("not-possible-lasso", true)
        .classed("selected-lasso not-selected-lasso", false); // style as not possible
};

var lasso_draw = function(lasso) {
    // Style the possible dots
    lasso.items()
        .filter(function(d) {return d.possible === true;})
        .classed("not-possible-lasso", false)
        .classed("possible-lasso", true);
    // Style the not possible dot
    lasso.items().filter(function(d) {return d.possible === false;})
        .classed("not-possible-lasso", true)
        .classed("possible-lasso", false);
};

var lasso_end = function(lasso, svg, settings, scales, zoom) {
    lasso_off(svg, settings, zoom);
    var some_selected = false;
    if(lasso.items().filter(function(d) {return d.selected === true;}).size() !== 0){
        some_selected = true;
    }
    // Reset the color of all dots
    lasso.items()
        .style("fill", function(d) {
	    if (d3.select(this).classed('point-label')) { return d.scatterD3_lasso_text_fill; }
	    if (d3.select(this).classed('dot')) { return d.scatterD3_lasso_dot_fill; }
	    if (d3.select(this).classed('arrow')) { return d.scatterD3_lasso_arrow_fill; }
	    return null;
        })
        .style("opacity", function(d) {
	    if (d3.select(this).classed('point-label')) { return d.scatterD3_lasso_text_opacity; }
	    if (d3.select(this).classed('dot')) { return d.scatterD3_lasso_dot_opacity; }
	    if (d3.select(this).classed('arrow')) { return d.scatterD3_lasso_arrow_opacity; }
	    return null;
        })
        .style("stroke", function(d) {
	    if (d3.select(this).classed('point-label')) { return d.scatterD3_lasso_text_stroke; }
	    if (d3.select(this).classed('dot')) { return d.scatterD3_lasso_dot_stroke; }
	    if (d3.select(this).classed('arrow')) { return d.scatterD3_lasso_arrow_stroke; }
	    return null;
        });
    if (some_selected) {
        // Style the selected dots
        var sel = lasso.items().filter(function(d) {return d.selected === true;})
	    .classed("not-possible-lasso possible-lasso", false)
	    .classed("selected-lasso", true)
	    .style("opacity", "1");

        // Reset the style of the not selected dots
        lasso.items().filter(function(d) {return d.selected === false;})
	    .classed("not-possible-lasso possible-lasso", false)
	    .classed("not-selected-lasso", true)
	    .style("opacity", function(d) { return settings.point_opacity / 7; });

        // Call custom callback function
        var callback_sel = svg.selectAll(".dot, .arrow").filter(function(d) {return d.selected === true;});
        if (typeof settings.lasso_callback === 'function') settings.lasso_callback(callback_sel);
    }
    else {
        lasso.items()
	    .classed("not-possible-lasso possible-lasso not-selected-lasso selected-lasso", false)
	    .style("opacity", function(d) {
                if (d3.select(this).classed('point-label')) {return 1;};
		return d.opacity_var !== undefined ? scales.opacity(d.opacity_var) : settings.point_opacity;
	    });
    }
};


// Toggle lasso on / zoom off
function lasso_on(svg, settings, scales, zoom) {
    var root = svg.select(".root");
    var chart_body = svg.select(".chart-body");
    
    var lasso_classes = ".dot, .arrow, .point-label";
    // Disable zoom behavior
    root.on(".zoom", null);
    // Enable lasso
    var lasso = d3.lasso()
	.closePathDistance(2000)   // max distance for the lasso loop to be closed
	.closePathSelect(true)     // can items be selected by closing the path?
	.hoverSelect(true)         // can items by selected by hovering over them?
        .area(root)
        .items(chart_body.selectAll(lasso_classes))
    	.on("start", function() { lasso_start(lasso); })   // lasso start function
	.on("draw", function() { lasso_draw(lasso); })     // lasso draw function
	.on("end", function() { lasso_end(lasso, svg, settings, scales, zoom); });      // lasso end function
    root.call(lasso);

    // Change cursor style
    root.style("cursor", "crosshair");
    // Change togglers state
    var menu_entry = d3.select("#scatterD3-menu-" + settings.html_id + " .lasso-entry");
    var custom_entry = d3.select("#" + settings.dom_id_lasso_toggle);
    if (!menu_entry.empty()) {
        menu_entry.classed("active", true)
	    .html("Toggle lasso off");
    }
    if (!custom_entry.empty()) { custom_entry.classed("active", true); }
}

// Toggle lasso off / zoom on
function lasso_off(svg, settings, zoom) {
    var root = svg.select(".root");
    // Disable lasso
    root.on(".dragstart", null);
    root.on(".drag", null);
    root.on(".dragend", null);
    // Enable zoom
    root.call(zoom);
    // Change cursor style
    root.style("cursor", "move");
    // Change togglers state
    var menu_entry = d3.select("#scatterD3-menu-" + settings.html_id + " .lasso-entry");
    var custom_entry = d3.select("#" + settings.dom_id_lasso_toggle);
    if (!menu_entry.empty()) {
        menu_entry.classed("active", false)
	    .html("Toggle lasso on");
    }
    if (!custom_entry.empty()) { custom_entry.classed("active", false); }
}

// Toggle lasso state when element clicked
function lasso_toggle(svg, settings, scales, zoom) {
    var menu_entry = d3.select("#scatterD3-menu-" + settings.html_id + " .lasso-entry");
    var custom_entry = d3.select("#" + settings.dom_id_lasso_toggle);
    if (settings.lasso &&
        ((!menu_entry.empty() && menu_entry.classed("active")) ||
         (!custom_entry.empty() && custom_entry.classed("active")))) {
        lasso_off(svg, settings, zoom);
    }
    else {
        lasso_on(svg, settings, scales, zoom);
    }
}
