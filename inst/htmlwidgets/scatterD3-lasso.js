// Lasso functions to execute while lassoing
var lasso_start = function(lasso) {

    lasso.items()
        .each(function(d){
	    if (d3v6.select(this).classed('dot')) {
                d.scatterD3_lasso_dot_stroke = d.scatterD3_lasso_dot_stroke ? d.scatterD3_lasso_dot_stroke : d3v6.select(this).style("stroke");
                d.scatterD3_lasso_dot_fill = d.scatterD3_lasso_dot_fill ? d.scatterD3_lasso_dot_fill : d3v6.select(this).style("fill");
                d.scatterD3_lasso_dot_opacity = d.scatterD3_lasso_dot_opacity ? d.scatterD3_lasso_dot_opacity : d3v6.select(this).style("opacity");
	    }
	    if (d3v6.select(this).classed('arrow')) {
                d.scatterD3_lasso_arrow_stroke = d.scatterD3_lasso_arrow_stroke ? d.scatterD3_lasso_arrow_stroke : d3v6.select(this).style("stroke");
                d.scatterD3_lasso_arrow_fill = d.scatterD3_lasso_arrow_fill ? d.scatterD3_lasso_arrow_fill : d3v6.select(this).style("fill");
                d.scatterD3_lasso_arrow_opacity = d.scatterD3_lasso_arrow_opacity ? d.scatterD3_lasso_arrow_opacity : d3v6.select(this).style("opacity");
	    }
	    if (d3v6.select(this).classed('point-label')) {
                d.scatterD3_lasso_text_stroke = d.scatterD3_lasso_text_stroke ? d.scatterD3_lasso_text_stroke : d3v6.select(this).style("stroke");
                d.scatterD3_lasso_text_fill = d.scatterD3_lasso_text_fill ? d.scatterD3_lasso_text_fill : d3v6.select(this).style("fill");
                d.scatterD3_lasso_text_opacity = d.scatterD3_lasso_text_opacity ? d.scatterD3_lasso_text_opacity : d3v6.select(this).style("opacity");
        }
        if (d3v6.select(this).classed('point-label-line')) {
            d.scatterD3_lasso_line_stroke = d.scatterD3_lasso_line_stroke ? d.scatterD3_lasso_line_stroke : d3v6.select(this).style("stroke");
            d.scatterD3_lasso_line_fill = d.scatterD3_lasso_line_fill ? d.scatterD3_lasso_line_fill : d3v6.select(this).style("fill");
            d.scatterD3_lasso_line_opacity = d.scatterD3_lasso_line_opacity ? d.scatterD3_lasso_line_opacity : d3v6.select(this).style("opacity");
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

var lasso_end = function(lasso, chart) {
    lasso_off(chart);
    var some_selected = false;
    if(lasso.items().filter(function(d) {return d.selected === true;}).size() !== 0){
        some_selected = true;
    }
    // Reset the color of all dots
    lasso.items()
        .style("fill", function(d) {
        if (d3v6.select(this).classed('point-label')) { return d.scatterD3_lasso_text_fill; }
        if (d3v6.select(this).classed('point-label-line')) { return d.scatterD3_lasso_line_fill; }
	    if (d3v6.select(this).classed('dot')) { return d.scatterD3_lasso_dot_fill; }
	    if (d3v6.select(this).classed('arrow')) { return d.scatterD3_lasso_arrow_fill; }
	    return null;
        })
        .style("opacity", function(d) {
        if (d3v6.select(this).classed('point-label')) { return d.scatterD3_lasso_text_opacity; }
        if (d3v6.select(this).classed('point-label-line')) { return d.scatterD3_lasso_line_opacity; }
	    if (d3v6.select(this).classed('dot')) { return d.scatterD3_lasso_dot_opacity; }
	    if (d3v6.select(this).classed('arrow')) { return d.scatterD3_lasso_arrow_opacity; }
	    return null;
        })
        .style("stroke", function(d) {
        if (d3v6.select(this).classed('point-label')) { return d.scatterD3_lasso_text_stroke; }
        if (d3v6.select(this).classed('point-label-line')) { return d.scatterD3_lasso_line_stroke; }
	    if (d3v6.select(this).classed('dot')) { return d.scatterD3_lasso_dot_stroke; }
	    if (d3v6.select(this).classed('arrow')) { return d.scatterD3_lasso_arrow_stroke; }
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
	        .style("opacity", function(d) { return chart.settings().point_opacity / 7; });

        // Call custom callback function
        var callback_sel = chart.svg().selectAll(".dot, .arrow").filter(function(d) {return d.selected === true;});
        if (typeof chart.settings().lasso_callback === 'function') chart.settings().lasso_callback(callback_sel);
    }
    else {
        lasso.items()
	    .classed("not-possible-lasso possible-lasso not-selected-lasso selected-lasso", false)
	    .style("opacity", function(d) {
            if (d3v6.select(this).classed('point-label')) {return 1;};
		    return d.opacity_var !== undefined ? chart.scales().opacity(d.opacity_var) : chart.settings().point_opacity;
	    });
    }
};


// Toggle lasso on / zoom off
function lasso_on(chart) {

    var root = chart.svg().select(".root");
    var chart_body = chart.svg().select(".chart-body");

    var lasso_classes = ".dot, .arrow, .point-label, .point-label-line";
    // Disable zoom behavior
    root.on(".zoom", null);
    // Enable lasso
    var lasso = d3v6.lasso()
	    .closePathDistance(2000)   // max distance for the lasso loop to be closed
	    .closePathSelect(true)     // can items be selected by closing the path?
	    .hoverSelect(true)         // can items by selected by hovering over them?
        .area(root)
        .items(chart_body.selectAll(lasso_classes))
    	.on("start", function() { lasso_start(lasso); })
	    .on("draw", function() { lasso_draw(lasso); })     
	    .on("end", function() { lasso_end(lasso, chart); }); 
    root.call(lasso);

    // Change cursor style
    root.style("cursor", "crosshair");
    // Change togglers state
    var menu_entry = d3v6.select("#scatterD3-menu-" + chart.settings().html_id + " .lasso-entry");
    var custom_entry = d3v6.select("#" + chart.settings().dom_id_lasso_toggle);
    if (!menu_entry.empty()) {
        menu_entry.classed("active", true)
	    .html("Toggle lasso off");
    }
    if (!custom_entry.empty()) { custom_entry.classed("active", true); }
}


// Toggle lasso off / zoom on
function lasso_off(chart) {

    var root = chart.svg().select(".root");

    // Disable lasso
    root.on(".dragstart", null);
    root.on(".drag", null);
    root.on(".dragend", null);
    // Enable zoom
    root.call(chart.zoom());
    // Change cursor style
    root.style("cursor", "move");
    // Change togglers state
    var menu_entry = d3v6.select("#scatterD3-menu-" + chart.settings().html_id + " .lasso-entry");
    var custom_entry = d3v6.select("#" + chart.settings().dom_id_lasso_toggle);
    if (!menu_entry.empty()) {
        menu_entry
            .classed("active", false)
	        .html("Toggle lasso on");
    }
    if (!custom_entry.empty()) { custom_entry.classed("active", false); }
}

// Toggle lasso state when element clicked
function lasso_toggle(chart) {
    var menu_entry = d3v6.select("#scatterD3-menu-" + chart.settings().html_id + " .lasso-entry");
    var custom_entry = d3v6.select("#" + chart.settings().dom_id_lasso_toggle);
    if (chart.settings().lasso &&
        ((!menu_entry.empty() && menu_entry.classed("active")) ||
         (!custom_entry.empty() && custom_entry.classed("active")))) {
        lasso_off(chart);
    }
    else {
        lasso_on(chart);
    }
}
