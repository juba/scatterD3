


// Compute x and y axes limits
function compute_limits(chart) {

    var min_x, min_y, max_x, max_y, gap_x, gap_y;
    var settings = chart.settings();
    var data = chart.data();

    // x and y limits
    if (settings.xlim === null) {
        min_x = d3v6.min(data, d => d.x);
        max_x = d3v6.max(data, d => d.x);
        gap_x = (max_x - min_x) * 0.2;
        if (min_x == max_x) {
            min_x = min_x * 0.8;
            max_x = max_x * 1.2;
            gap_x = 0;
        }
        if (min_x == 0 && max_x == 0) {
            min_x = -1;
            max_x = 1;
            gap_x = 0.1;
        }
    } else {
        min_x = settings.xlim[0];
        max_x = settings.xlim[1];
        gap_x = 0;
    }
    if (settings.ylim === null) {
        min_y = d3v6.min(data, d => d.y);
        max_y = d3v6.max(data, d => d.y);
        gap_y = (max_y - min_y) * 0.2;
        if (min_y == max_y) {
            min_y = min_y * 0.8;
            max_y = max_y * 1.2;
            gap_y = 0;
        }
        if (min_y == 0 && max_y == 0) {
            min_y = -1;
            max_y = 1;
            gap_y = 0.1;
        }
    } else {
        min_y = settings.ylim[0];
        max_y = settings.ylim[1];
        gap_y = 0;
    }

    min_x = settings.x_log ? min_x * 0.8 : min_x - gap_x;
    max_x = settings.x_log ? max_x * 1.3 : max_x + gap_x;
    min_y = settings.y_log ? min_y * 0.9 : min_y - gap_y;
    max_y = settings.y_log ? max_y * 1.1 : max_y + gap_y;

    // Fixed ratio
    var range_x = max_x - min_x;
    var mid_x = (max_x + min_x) / 2;
    var range_y = max_y - min_y;
    var mid_y = (max_y + min_y) / 2;
    if (settings.fixed && settings.xlim === null && settings.ylim === null) {
        var ratio = (range_y / range_x);
        if (ratio > 1) {
            range_x = range_x * ratio;
            min_x = mid_x - range_x / 2;
            max_x = mid_x + range_x / 2;
        } else {
            range_y = range_y / ratio;
            min_y = mid_y - range_y / 2;
            max_y = mid_y + range_y / 2;
        }
    }
    if (settings.fixed && settings.xlim != null) {
        range_y = range_x;
        min_y = mid_y - range_y / 2;
        max_y = mid_y + range_y / 2;
    }
    if (settings.fixed && settings.ylim != null) {
        range_x = range_y;
        min_x = mid_x - range_x / 2;
        max_x = mid_x + range_x / 2;
    }

    return {min_x: min_x, max_x: max_x, min_y: min_y, max_y: max_y};
}



// Compute and setup scales
function setup_scales(chart) {

    var scales = {};
    var settings = chart.settings();
    var dims = chart.dims();
    var data = chart.data();

    // if data is empty
    if (data.length == 0) {
        settings.x_categorical = false;
        settings.y_categorical = false;
        chart.settings(settings);
        chart.data([{ x: 0, y: 0, key: 1 }]);
    }

    var limits = compute_limits(chart);

    // x, y scales
    if (!settings.x_categorical) {
        scales.x = settings.x_log ? d3v6.scaleLog() : d3v6.scaleLinear();
        scales.x.range([0, dims.width])
            .domain([limits.min_x, limits.max_x]);
    } else {
        var x_domain = settings.x_levels === null ?
            [...new Set(data.map(d => d.x))].sort() :
            settings.x_levels;
        scales.x = d3v6.scalePoint()
            .range([0, dims.width])
            .padding(0.9)
            .domain(x_domain);
    }
    if (!settings.y_categorical) {
        scales.y = settings.y_log ? d3v6.scaleLog() : d3v6.scaleLinear();
        scales.y.range([dims.height, 0])
            .domain([limits.min_y, limits.max_y]);
    } else {
        var y_domain = settings.y_levels === null ?
            [...new Set(data.map(d => d.y))].sort() :
            settings.y_levels;
        scales.y = d3v6.scalePoint()
            .range([dims.height, 0])
            .padding(0.9)
            .domain(y_domain);
    }
    // Keep track of original scales
    scales.x_orig = scales.x;
    scales.y_orig = scales.y;
    // x and y axis functions
    scales.xAxis = d3v6.axisBottom(scales.x)
        .tickSize(-dims.height);
    if (!settings.x_categorical) {
        scales.xAxis.tickFormat(d3v6.format(""));
    }
    scales.yAxis = d3v6.axisLeft(scales.y)
        .tickSize(-dims.width);
    if (!settings.y_categorical) {
        scales.yAxis.tickFormat(d3v6.format(""));
    }

    // Continuous color scale
    if (settings.col_continuous) {
        if (settings.colors === null) {
            scales.color = d3v6.scaleSequential(d3v6.interpolateViridis);
        } else {
            scales.color = d3v6.scaleSequential(d3v6[settings.colors]);
        }
        scales.color = scales.color
            .domain([d3v6.min(data, d => d.col_var),
                     d3v6.max(data, d => d.col_var)]);
    }
    // Ordinal color scale
    else {
        if (settings.colors === null) {
            // Number of different levels. See https://github.com/mbostock/d3/issues/472
            var n = new Set(data.map(d => d.col_var)).size;
            scales.color = n <= 10 ? d3v6.scaleOrdinal(custom_scheme10()) : d3v6.scaleOrdinal(d3v6.schemePaired);
        } else if (Array.isArray(settings.colors)) {
            scales.color = d3v6.scaleOrdinal().range(settings.colors);
        } else if (typeof (settings.colors) === "string") {
            // Single string given
            scales.color = d3v6.scaleOrdinal().range(Array(settings.colors));
        } else if (typeof (settings.colors) === "object") {
            scales.color = d3v6.scaleOrdinal()
                .range(Object.values(settings.colors))
                .domain(Object.keys(settings.colors));
        }
    }

    // Symbol scale
    var symbol_table = {
        "circle": d3v6.symbolCircle,
        "cross": d3v6.symbolCross,
        "diamond": d3v6.symbolDiamond,
        "square": d3v6.symbolSquare,
        "star": d3v6.symbolStar,
        "triangle": d3v6.symbolTriangle,
        "wye": d3v6.symbolWye,
    }
    if (settings.symbols === null) {
        scales.symbol = d3v6.scaleOrdinal().range(d3v6.symbols);
    } else if (Array.isArray(settings.symbols)) {
        scales.symbol = d3v6.scaleOrdinal().range(settings.symbols.map(d => symbol_table[d]));
    } else if (typeof (settings.symbols) === "string") {
        // Single string given
        scales.symbol = d3v6.scaleOrdinal().range(Array(symbol_table[settings.symbols]));
    } else if (typeof (settings.symbols) === "object") {
        scales.symbol = d3v6.scaleOrdinal()
            .range(Object.values(settings.symbols).map(d => symbol_table[d]))
            .domain(Object.keys(settings.symbols))
    }

    // Size scale
    if (settings.sizes === null) {
        scales.size = d3v6.scaleLinear()
            .range(settings.size_range)
            .domain([d3v6.min(data, d => d.size_var),
            d3v6.max(data, d => d.size_var)]);
    } else if (typeof(settings.sizes) === "object") {
        scales.size = d3v6.scaleOrdinal()
            .range(Object.values(settings.sizes))
            .domain(Object.keys(settings.sizes));
    }

    // Opacity scale
    if (settings.opacities === null) {
        scales.opacity = d3v6.scaleLinear()
            .range([0.1, 1])
            .domain([d3v6.min(data, d => d.opacity_var),
            d3v6.max(data, d => d.opacity_var)]);
    } else if (typeof(settings.opacities) === "object") {
        scales.opacity = d3v6.scaleOrdinal()
            .range(Object.values(settings.opacities))
            .domain(Object.keys(settings.opacities));
    }

    return scales;

}
