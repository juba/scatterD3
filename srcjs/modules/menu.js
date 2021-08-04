import {export_svg, export_labels_position} from "./exports";
import { gear_path } from "./utils";
import * as lasso from "./lasso";
import * as zoom from "./zoom";
import * as d3 from "d3";

// Add menu to chart
export function create(chart) {

    var svg = chart.svg();

    // Gear icon
    var gear = svg.append("g")
        .attr("class", "gear-menu")
        .attr("transform", "translate(" + (chart.width() - 40) + "," + 10 + ")");
    gear.append("rect")
        .attr("class", "gear-toggle")
        .attr("width", "25")
        .attr("height", "25")
        .style("fill", "#FFFFFF");
    gear.append("path")
        .attr("d", gear_path())
        .attr("transform", "translate(-3,3)")
        .style("fill", "#666666");

    var menu_parent = d3.select(svg.node().parentNode);
    menu_parent.style("position", "relative");
    var menu = menu_parent.select(".scatterD3-menu");

    menu.attr("id", "scatterD3-menu-" + chart.settings().html_id);

    menu.append("li")
        .append("a")
        .on("click", function () { zoom.reset(chart) })
        .html("Reset zoom");

    menu.append("li")
        .append("a")
        .on("click", function () { export_svg(this, chart); })
        .html("Export to SVG");

    if (chart.settings().lasso) {
        menu.append("li")
            .append("a")
            .attr("class", "lasso-entry")
            .on("click", function() { lasso.toggle(chart); })
            .html("Toggle lasso on");
    }

    var label_export = menu.append("li")
        .attr("class", "label-export");
    label_export.append("a")
        .on("click", function () { export_labels_position(this, chart); })
        .html("Export labels positions");
    if (!chart.settings().has_labels) {
        label_export.style("display", "none");
    }

    gear.on("click", (event, d, i) => {
        var menu_parent = d3.select(svg.node().parentNode);
        var menu = menu_parent.select(".scatterD3-menu");
        var gear = svg.select(".gear-menu");
        if (!menu.classed("open")) {
            menu.transition().duration(300)
                .style("opacity", "0.95")
                .style("width", "165px");
            gear.classed("selected", true);
            menu.classed("open", true);
        } else {
            menu.transition().duration(300)
                .style("opacity", "0")
                .style("width", "0px");
            gear.classed("selected", false);
            menu.classed("open", false);
        }
    });
}

// Move menu icon when plot is resized
export function move(chart) {
    if (!chart.settings().menu) return;
    chart.svg().select(".gear-menu")
        .attr("transform", "translate(" + (chart.width() - 40) + "," + 10 + ")");
}

