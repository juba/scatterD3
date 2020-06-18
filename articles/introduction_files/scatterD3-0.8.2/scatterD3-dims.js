

// Setup dimensions
function setup_dims(chart) {

    var dims = {},
        margins = { top: 5, right: 10, bottom: 20, left: 30 };

    if (chart.settings().left_margin !== null) {
        margins.left = chart.settings().left_margin;
    }

    dims.svg_width = chart.width();
    dims.svg_height = chart.height();

    dims.legend_width = 0;
    if (chart.settings().has_legend) dims.legend_width = chart.settings().legend_width;

    dims.width = dims.svg_width - dims.legend_width;
    dims.height = dims.svg_height;
    dims.height = dims.height - margins.top - margins.bottom;
    dims.width = dims.width - margins.left - margins.right;

    // Fixed ratio
    if (chart.settings().fixed) {
        dims.height = Math.min(dims.height, dims.width);
        dims.width = dims.height;
    }

    dims.total_width = dims.width + margins.left + margins.right + dims.legend_width;
    dims.total_height = dims.height + margins.top + margins.bottom;

    dims.legend_x = dims.total_width - margins.right - dims.legend_width + 24;

    dims.margins = margins;

    return dims;
}

// Compute and setup legend positions
function setup_legend_dims(chart) {

    var dims = chart.dims();

    dims.margins.legend_top = 50;

    // Height of color legend
    var color_legend_height = 0;
    if (chart.settings().has_color_var) {
        var n = chart.settings().col_continuous ? 6 : chart.scales().color.domain().length;
        color_legend_height = n * 20 + 30;
    }
    dims.margins.symbol_legend_top = color_legend_height + dims.margins.legend_top;

    // Height of symbol legend
    var symbol_legend_height = chart.settings().has_symbol_var ? chart.scales().symbol.domain().length * 20 + 30 : 0;
    dims.margins.size_legend_top = color_legend_height + symbol_legend_height + dims.margins.legend_top;

    return dims;
}



