


// Compute x and y axes limits
function compute_limits(chart) {

    var min_x, min_y, max_x, max_y, gap_x, gap_y;
    var settings = chart.settings();
    var data = chart.data();

    // x and y limits
    if (settings.xlim === null) {
        min_x = d3v5.min(data, function (d) { return (d.x); });
        max_x = d3v5.max(data, function (d) { return (d.x); });
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
        min_y = d3v5.min(data, function (d) { return (d.y); });
        max_y = d3v5.max(data, function (d) { return (d.y); });
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
        scales.x = settings.x_log ? d3v5.scaleLog() : d3v5.scaleLinear();
        scales.x.range([0, dims.width])
            .domain([limits.min_x, limits.max_x]);
    } else {
        scales.x = d3v5.scalePoint()
            .range([0, dims.width])
            .padding(0.9)
            .domain(d3v5.map(data, function (d) { return d.x; }).keys().sort());
    }
    if (!settings.y_categorical) {
        scales.y = settings.y_log ? d3v5.scaleLog() : d3v5.scaleLinear();
        scales.y.range([dims.height, 0])
            .domain([limits.min_y, limits.max_y]);
    } else {
        scales.y = d3v5.scalePoint()
            .range([dims.height, 0])
            .padding(0.9)
            .domain(d3v5.map(data, function (d) { return d.y; }).keys().sort());
    }
    // Keep track of original scales
    scales.x_orig = scales.x;
    scales.y_orig = scales.y;
    // x and y axis functions
    scales.xAxis = d3v5.axisBottom(scales.x)
        .tickSize(-dims.height);
    if (!settings.x_categorical) {
        scales.xAxis.tickFormat(d3v5.format(""));
    }
    scales.yAxis = d3v5.axisLeft(scales.y)
        .tickSize(-dims.width);
    if (!settings.y_categorical) {
        scales.yAxis.tickFormat(d3v5.format(""));
    }

    // Continuous color scale
    if (settings.col_continuous) {
        if (settings.colors === null) {
            scales.color = d3v5.scaleSequential(d3v5.interpolateViridis);
        } else {
            scales.color = d3v5.scaleSequential(d3v5[settings.colors]);
        }
        scales.color = scales.color
            .domain([d3v5.min(data, function (d) { return (d.col_var); }),
                     d3v5.max(data, function (d) { return (d.col_var); })]);
    }
    // Ordinal color scale
    else {
        if (settings.colors === null) {
            // Number of different levels. See https://github.com/mbostock/d3/issues/472
            var n = d3v5.map(data, function (d) { return d.col_var; }).size();
            scales.color = n <= 10 ? d3v5.scaleOrdinal(custom_scheme10()) : d3v5.scaleOrdinal(d3v5.schemePaired);
        } else if (Array.isArray(settings.colors)) {
            scales.color = d3v5.scaleOrdinal().range(settings.colors);
        } else if (typeof (settings.colors) === "string") {
            // Single string given
            scales.color = d3v5.scaleOrdinal().range(Array(settings.colors));
        } else if (typeof (settings.colors) === "object") {
            scales.color = d3v5.scaleOrdinal()
                .range(d3v5.values(settings.colors))
                .domain(d3v5.keys(settings.colors));
        }
    }

    // Symbol scale
    var symbol_table = {
        "circle": d3v5.symbolCircle,
        "cross": d3v5.symbolCross,
        "diamond": d3v5.symbolDiamond,
        "square": d3v5.symbolSquare,
        "star": d3v5.symbolStar,
        "triangle": d3v5.symbolTriangle,
        "wye": d3v5.symbolWye,
    }
    if (settings.symbols === null) {
        scales.symbol = d3v5.scaleOrdinal().range(d3v5.symbols);
    } else if (Array.isArray(settings.symbols)) {
        scales.symbol = d3v5.scaleOrdinal().range(settings.symbols.map(function (d) { return symbol_table[d]; }));
    } else if (typeof (settings.symbols) === "string") {
        // Single string given
        scales.symbol = d3v5.scaleOrdinal().range(Array(symbol_table[settings.symbols]));
    } else if (typeof (settings.symbols) === "object") {
        scales.symbol = d3v5.scaleOrdinal()
            .range(d3v5.values(settings.symbols).map(function (d) { return symbol_table[d]; }))
            .domain(d3v5.keys(settings.symbols))
    }

    // Size scale
    if (settings.sizes === null) {
        scales.size = d3v5.scaleLinear()
            .range(settings.size_range)
            .domain([d3v5.min(data, function (d) { return (d.size_var); }),
            d3v5.max(data, function (d) { return (d.size_var); })]);
    } else if (typeof(settings.sizes) === "object") {
        scales.size = d3v5.scaleOrdinal()
            .range(d3v5.values(settings.sizes))
            .domain(d3v5.keys(settings.sizes));
    }

    // Opacity scale
    if (settings.opacities === null) {
        scales.opacity = d3v5.scaleLinear()
            .range([0.1, 1])
            .domain([d3v5.min(data, function (d) { return (d.opacity_var); }),
            d3v5.max(data, function (d) { return (d.opacity_var); })]);
    } else if (typeof(settings.opacities) === "object") {
        scales.opacity = d3v5.scaleOrdinal()
            .range(d3v5.values(settings.opacities))
            .domain(d3v5.keys(settings.opacities));
    }

    return scales;

}