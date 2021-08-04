import * as d3 from "d3";
import { caption_path } from "./utils";

// Add caption
export function create(chart) {

    var caption_parent = d3.select(chart.svg().node().parentNode);
    var caption = caption_parent.select(".scatterD3-caption");

    if (chart.settings().caption.title)
        caption.append("h1").attr("class", "title").html(chart.settings().caption.title);
    if (chart.settings().caption.subtitle)
        caption.append("h2").attr("class", "subtitle").html(chart.settings().caption.subtitle);
    if (chart.settings().caption.text)
        caption.append("p").attr("class", "caption").html(chart.settings().caption.text);
    caption.style("top", chart.dims().svg_height + "px");

    // Caption icon
    var caption_top_margin = chart.settings().menu ? 35 : 10;
    var caption_icon = chart.svg().append("g")
        .attr("class", "caption-icon")
        .attr("transform", "translate(" + (chart.dims().svg_width - 40) + "," + (chart.dims().svg_height - 71) + ")")
        .attr("transform", "translate(" + (chart.dims().svg_width - 40) + "," + caption_top_margin + ")");
    caption_icon.append("rect")
        .attr("class", "caption-toggle")
        .attr("width", "25")
        .attr("height", "25")
        .style("fill", "#FFFFFF");
    caption_icon.append("path")
        .attr("d", caption_path())
        .attr("transform", "translate(4,4)")
        .style("fill", "#666666");

    caption_icon.on("click", function () {
        if (!caption.classed("visible")) {
            caption.classed("visible", true);
            caption.style("margin-top", -caption.node().getBoundingClientRect().height + "px");
        }
        else {
            caption.classed("visible", false);
            caption.style("margin-top", "0px");
        }
    });

    caption.on("click", function () {
        caption.classed("visible", false);
        caption.style("margin-top", "0px");
    });

}

// Move caption icon and position when plot is resized
export function move(chart) {
	if (!chart.settings().caption) return;
	var caption_top_margin = chart.settings().menu ? 35 : 10;
	chart.svg().select(".caption-icon")
        .attr("transform", "translate(" + (chart.dims().svg_width - 40) + "," + caption_top_margin + ")");
	d3.select(chart.svg().node().parentNode)
		.select(".scatterD3-caption")
		.style("top", chart.dims().svg_height + "px");

}
