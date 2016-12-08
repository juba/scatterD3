// Custom color scheme
function custom_scheme10 () {
    // slice() to create a copy
    var scheme = d3.schemeCategory10.slice();
    // Switch orange and red
    var	tmp = scheme[3];
    scheme[3] = scheme[1];
    scheme[1] = tmp;
    return scheme;
}

// Setup dimensions
function setup_sizes (width, height, settings) {

    var dims = {},
	margins = {top: 5, right: 10, bottom: 20, left: 30};

    if (settings.left_margin !== null) {
	margins.left = settings.left_margin;
    }

    dims.svg_width = width;
    dims.svg_height = height;
    
    dims.legend_width = 0;
    if (settings.has_legend) dims.legend_width = settings.legend_width;
    
    dims.width = width - dims.legend_width;
    dims.height = height;
    dims.height = dims.height - margins.top - margins.bottom;
    dims.width = dims.width - margins.left - margins.right;
    
    // Fixed ratio
    if (settings.fixed) {
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
function setup_legend_sizes (dims, scales, settings) {

    dims.margins.legend_top = 50;

    // Height of color legend
    var color_legend_height = 0;
    if (settings.has_color_var) {
	var n = settings.col_continuous ? 6 : scales.color.domain().length;
	color_legend_height = n * 20 + 30;
    }
    dims.margins.symbol_legend_top = color_legend_height + dims.margins.legend_top;

    // Height of symbol legend
    var symbol_legend_height = settings.has_symbol_var ? scales.symbol.domain().length * 20 + 30 : 0;
    dims.margins.size_legend_top = color_legend_height + symbol_legend_height + dims.margins.legend_top;
    
    return dims;
}

// Compute and setup scales
function setup_scales (dims, settings, data) {

    var min_x, min_y, max_x, max_y, gap_x, gap_y;
    var scales = {};

    // if data is empty
    if (data.length == 0) {
	settings.x_categorical = false;
	settings.y_categorical = false;
	data = [{x:0, y:0, key:1}];
    }
    
    // x and y limits
    if (settings.xlim === null) {
        min_x = d3.min(data, function(d) { return(d.x);} );
        max_x = d3.max(data, function(d) { return(d.x);} );
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
        min_y = d3.min(data, function(d) { return(d.y);} );
        max_y = d3.max(data, function(d) { return(d.y);} );
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

    
    // x, y scales
    if (!settings.x_categorical) {
	scales.x = settings.x_log ? d3.scaleLog() : d3.scaleLinear();
        scales.x.range([0, dims.width])
	    .domain([min_x, max_x]);
    } else {
	scales.x = d3.scalePoint()
	    .range([0, dims.width])
	    .padding(0.9)
	    .domain(d3.map(data, function(d){ return d.x; }).keys().sort());
    }
    if (!settings.y_categorical) {
	scales.y = settings.y_log ? d3.scaleLog(): d3.scaleLinear();
        scales.y.range([dims.height, 0])
	    .domain([min_y, max_y]);
    } else {
	scales.y = d3.scalePoint()
	    .range([dims.height, 0])
	    .padding(0.9)
	    .domain(d3.map(data, function(d){ return d.y; }).keys().sort());
    }
    // Keep track of original scales
    scales.x_orig = scales.x;
    scales.y_orig = scales.y;
    // x and y axis functions
    scales.xAxis = d3.axisBottom(scales.x)
        .tickSize(-dims.height);
    if (!settings.x_categorical) {
	scales.xAxis.tickFormat(d3.format(""));
    }
    scales.yAxis = d3.axisLeft(scales.y)
        .tickSize(-dims.width);
    if (!settings.y_categorical) {
	scales.yAxis.tickFormat(d3.format(""));
    }
    // Continuous color scale
    if (settings.col_continuous) {
	scales.color = d3.scaleSequential(d3.interpolateViridis)
	    .domain([d3.min(data, function(d) { return(d.col_var);} ),
		     d3.max(data, function(d) { return(d.col_var);} )]);
    }
    // Ordinal color scale
    else {
        if (settings.colors === null) {
	    // Number of different levels. See https://github.com/mbostock/d3/issues/472
	    var n = d3.map(data, function(d) { return d.col_var; }).size();
	    scales.color = n <= 9 ? d3.scaleOrdinal(custom_scheme10()) : d3.scaleOrdinal(d3.schemeCategory20);
        } else if (Array.isArray(settings.colors)) {
	    scales.color = d3.scaleOrdinal().range(settings.colors);
        } else if (typeof(settings.colors) === "string"){
	    // Single string given
	    scales.color = d3.scaleOrdinal().range(Array(settings.colors));
        } else if (typeof(settings.colors) === "object"){
	    scales.color = d3.scaleOrdinal()
                .range(d3.values(settings.colors))
                .domain(d3.keys(settings.colors));
        }
    }
    // Symbol scale
    scales.symbol = d3.scaleOrdinal().range(d3.range(d3.symbols.length));
    // Size scale
    scales.size = d3.scaleLinear()
        .range(settings.size_range)
        .domain([d3.min(data, function(d) { return(d.size_var);} ),
                 d3.max(data, function(d) { return(d.size_var);} )]);
    // Opacity scale
    scales.opacity = d3.scaleLinear()
        .range([0.1, 1])
        .domain([d3.min(data, function(d) { return(d.opacity_var);} ),
                 d3.max(data, function(d) { return(d.opacity_var);} )]);

    return scales;
    
}




// Gear icon path
function gear_path () {
    return "m 24.28,7.2087374 -1.307796,0 c -0.17052,-0.655338 -0.433486,-1.286349 -0.772208,-1.858846 l 0.927566,-0.929797 c 0.281273,-0.281188 0.281273,-0.738139 0,-1.019312 L 21.600185,1.8728727 C 21.319088,1.591685 20.863146,1.5914219 20.582048,1.8726096 L 19.650069,2.8001358 C 19.077606,2.4614173 18.446602,2.1982296 17.791262,2.0278389 l 0,-1.30783846 c 0,-0.39762 -0.313645,-0.72 -0.711262,-0.72 l -2.16,0 c -0.397618,0 -0.711262,0.32238 -0.711262,0.72 l 0,1.30783846 c -0.65534,0.1703907 -1.286345,0.43344 -1.858849,0.7722138 L 11.420092,1.8724435 c -0.281185,-0.2812846 -0.738131,-0.2812846 -1.019315,0 L 8.8728737,3.3998124 C 8.5916888,3.6809174 8.591427,4.1368574 8.872612,4.4179484 l 0.9275234,0.931984 c -0.3388099,0.572456 -0.6019076,1.203467 -0.7722956,1.858805 l -1.3078398,0 c -0.3976159,0 -0.72,0.313643 -0.72,0.711263 L 7,10.08 c 0,0.397661 0.3223841,0.711263 0.72,0.711263 l 1.3078398,0 c 0.170388,0.655338 0.4334414,1.286349 0.7722084,1.858846 L 8.872349,13.579906 c -0.2811836,0.281105 -0.2811836,0.738139 0,1.019188 l 1.527378,1.527951 c 0.281185,0.28127 0.737041,0.281533 1.018224,3.04e-4 l 0.931981,-0.927484 c 0.572461,0.338718 1.203466,0.601823 1.858806,0.772338 l 0,1.307797 c 0,0.397662 0.313644,0.72 0.711262,0.72 l 2.16,0 c 0.39766,0 0.711262,-0.32238 0.711262,-0.72 l 0,-1.307797 c 0.65534,-0.170515 1.286344,-0.433481 1.858849,-0.772214 l 0.929797,0.927568 c 0.281098,0.281271 0.738131,0.281271 1.019184,0 l 1.527947,-1.527369 c 0.281273,-0.281105 0.281534,-0.737045 3.06e-4,-1.018136 l -0.92748,-0.931984 c 0.338723,-0.572456 0.601819,-1.203467 0.772339,-1.858805 l 1.307796,0 c 0.39766,0 0.72,-0.313643 0.72,-0.711263 l 0,-2.1599996 c 0,-0.39762 -0.322384,-0.711263 -0.72,-0.711263 z M 16,12.6 c -1.988258,0 -3.6,-1.611789 -3.6,-3.5999996 0,-1.988252 1.611742,-3.6 3.6,-3.6 1.988258,0 3.6,1.611748 3.6,3.6 C 19.6,10.988252 17.988258,12.6 16,12.6 Z";
}

// Caption icon path
function caption_path () {
    return "m 9.0084765,0.0032163 q 1.8249645,0 3.4939395,0.7097539 1.668974,0.7096153 2.87781,1.918523 1.208839,1.2087707 1.91855,2.8777847 0.709702,1.6690155 0.709702,3.4939387 0,1.8249234 -0.709702,3.4939384 -0.709711,1.669015 -1.91855,2.877784 -1.208836,1.208907 -2.87781,1.918523 -1.668975,0.709754 -3.4939395,0.709754 -1.8249502,0 -3.493924,-0.709754 Q 3.8455651,16.583846 2.6367267,15.374939 1.4278885,14.16617 0.71819,12.497155 0.0084778,10.82814 0.0084778,9.0032166 0.0084778,7.1782934 0.71819,5.5092779 1.4278885,3.8402625 2.6367267,2.6314932 3.8455651,1.4225855 5.5145525,0.7129702 7.1835263,0.0032163 9.0084765,0.0032163 Z m 1.1698475,2.760786 -2.339681,0 q -0.1559905,0 -0.2729632,0.1176924 -0.117,0.1163076 -0.117,0.2730462 l 0,2.3395847 q 0,0.1560462 0.117,0.2730447 0.117,0.1176924 0.2729632,0.1176924 l 2.339681,0 q 0.155977,0 0.272963,-0.1176924 0.117,-0.1163076 0.117,-0.2730447 l 0,-2.3395847 q 0,-0.1560462 -0.117,-0.2730462 -0.117,-0.1176924 -0.272963,-0.1176924 z m 0,4.6794463 -3.8994777,0 q -0.1559772,0 -0.272963,0.1176924 -0.117,0.1163076 -0.117,0.2729078 l 0,0.7799524 q 0,0.1559078 0.117,0.2729078 0.117,0.1163076 0.272963,0.1163076 l 1.1698475,0 0,3.1195394 -1.1698475,0 q -0.1559772,0 -0.272963,0.117696 -0.117,0.116304 -0.117,0.273046 l 0,0.779815 q 0,0.156046 0.117,0.273046 0.117,0.116304 0.272963,0.116304 l 5.4592747,0 q 0.155977,0 0.272964,-0.116304 0.117,-0.116304 0.117,-0.273046 l 0,-0.779815 q 0,-0.156046 -0.117,-0.273046 -0.117,-0.117696 -0.272964,-0.117696 l -1.169848,0 0,-4.2893996 q 0,-0.1559078 -0.117,-0.2729078 -0.117,-0.1176924 -0.272963,-0.1176924 z";
}
