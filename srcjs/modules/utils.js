import * as d3 from "d3";

// Clean variables levels to be valid CSS classes
export function css_clean(s) {
    if (s === undefined) return "";
    return s.toString().replace(/[^\w-]/g, "_");
}

// Default translation function for points and labels
export function translation(d, scales) {
    return "translate(" + scales.x(d.x) + "," + scales.y(d.y) + ")";
}

// Key function to identify rows when interactively filtering
export function key(d) {
    return d.key_var;
}


// Create tooltip content function
export function tooltip_content(d, chart) {

    var settings = chart.settings();

    // no tooltips
    if (!settings.has_tooltips) return null;
    if (settings.has_custom_tooltips) {
        // custom tooltipsl
        return d.tooltip_text;
    } else {
        // default tooltips
        var text = Array();
        if (settings.has_labels) text.push("<b>" + d.lab + "</b>");
        var x_value = settings.x_categorical ? d.x : d.x.toFixed(3);
        var y_value = settings.y_categorical ? d.y : d.y.toFixed(3);
        text.push("<b>" + settings.xlab + ":</b> " + x_value);
        text.push("<b>" + settings.ylab + ":</b> " + y_value);
        if (settings.has_color_var) text.push("<b>" + settings.col_lab + ":</b> " + d.col_var);
        if (settings.has_symbol_var) text.push("<b>" + settings.symbol_lab + ":</b> " + d.symbol_var);
        if (settings.has_size_var) text.push("<b>" + settings.size_lab + ":</b> " + d.size_var);
        if (settings.has_opacity_var) text.push("<b>" + settings.opacity_lab + ":</b> " + d.opacity_var);
        return text.join("<br />");
    }
}

// Custom color scheme
export function custom_scheme10() {
    // slice() to create a copy
    var scheme = d3.schemeCategory10.slice();
    // Switch orange and red
    var tmp = scheme[3];
    scheme[3] = scheme[1];
    scheme[1] = tmp;
    return scheme;
}

// Gear icon path
export function gear_path() {
    return "m 24.28,7.2087374 -1.307796,0 c -0.17052,-0.655338 -0.433486,-1.286349 -0.772208,-1.858846 l 0.927566,-0.929797 c 0.281273,-0.281188 0.281273,-0.738139 0,-1.019312 L 21.600185,1.8728727 C 21.319088,1.591685 20.863146,1.5914219 20.582048,1.8726096 L 19.650069,2.8001358 C 19.077606,2.4614173 18.446602,2.1982296 17.791262,2.0278389 l 0,-1.30783846 c 0,-0.39762 -0.313645,-0.72 -0.711262,-0.72 l -2.16,0 c -0.397618,0 -0.711262,0.32238 -0.711262,0.72 l 0,1.30783846 c -0.65534,0.1703907 -1.286345,0.43344 -1.858849,0.7722138 L 11.420092,1.8724435 c -0.281185,-0.2812846 -0.738131,-0.2812846 -1.019315,0 L 8.8728737,3.3998124 C 8.5916888,3.6809174 8.591427,4.1368574 8.872612,4.4179484 l 0.9275234,0.931984 c -0.3388099,0.572456 -0.6019076,1.203467 -0.7722956,1.858805 l -1.3078398,0 c -0.3976159,0 -0.72,0.313643 -0.72,0.711263 L 7,10.08 c 0,0.397661 0.3223841,0.711263 0.72,0.711263 l 1.3078398,0 c 0.170388,0.655338 0.4334414,1.286349 0.7722084,1.858846 L 8.872349,13.579906 c -0.2811836,0.281105 -0.2811836,0.738139 0,1.019188 l 1.527378,1.527951 c 0.281185,0.28127 0.737041,0.281533 1.018224,3.04e-4 l 0.931981,-0.927484 c 0.572461,0.338718 1.203466,0.601823 1.858806,0.772338 l 0,1.307797 c 0,0.397662 0.313644,0.72 0.711262,0.72 l 2.16,0 c 0.39766,0 0.711262,-0.32238 0.711262,-0.72 l 0,-1.307797 c 0.65534,-0.170515 1.286344,-0.433481 1.858849,-0.772214 l 0.929797,0.927568 c 0.281098,0.281271 0.738131,0.281271 1.019184,0 l 1.527947,-1.527369 c 0.281273,-0.281105 0.281534,-0.737045 3.06e-4,-1.018136 l -0.92748,-0.931984 c 0.338723,-0.572456 0.601819,-1.203467 0.772339,-1.858805 l 1.307796,0 c 0.39766,0 0.72,-0.313643 0.72,-0.711263 l 0,-2.1599996 c 0,-0.39762 -0.322384,-0.711263 -0.72,-0.711263 z M 16,12.6 c -1.988258,0 -3.6,-1.611789 -3.6,-3.5999996 0,-1.988252 1.611742,-3.6 3.6,-3.6 1.988258,0 3.6,1.611748 3.6,3.6 C 19.6,10.988252 17.988258,12.6 16,12.6 Z";
}

// Caption icon path
export function caption_path() {
    return "m 9.0084765,0.0032163 q 1.8249645,0 3.4939395,0.7097539 1.668974,0.7096153 2.87781,1.918523 1.208839,1.2087707 1.91855,2.8777847 0.709702,1.6690155 0.709702,3.4939387 0,1.8249234 -0.709702,3.4939384 -0.709711,1.669015 -1.91855,2.877784 -1.208836,1.208907 -2.87781,1.918523 -1.668975,0.709754 -3.4939395,0.709754 -1.8249502,0 -3.493924,-0.709754 Q 3.8455651,16.583846 2.6367267,15.374939 1.4278885,14.16617 0.71819,12.497155 0.0084778,10.82814 0.0084778,9.0032166 0.0084778,7.1782934 0.71819,5.5092779 1.4278885,3.8402625 2.6367267,2.6314932 3.8455651,1.4225855 5.5145525,0.7129702 7.1835263,0.0032163 9.0084765,0.0032163 Z m 1.1698475,2.760786 -2.339681,0 q -0.1559905,0 -0.2729632,0.1176924 -0.117,0.1163076 -0.117,0.2730462 l 0,2.3395847 q 0,0.1560462 0.117,0.2730447 0.117,0.1176924 0.2729632,0.1176924 l 2.339681,0 q 0.155977,0 0.272963,-0.1176924 0.117,-0.1163076 0.117,-0.2730447 l 0,-2.3395847 q 0,-0.1560462 -0.117,-0.2730462 -0.117,-0.1176924 -0.272963,-0.1176924 z m 0,4.6794463 -3.8994777,0 q -0.1559772,0 -0.272963,0.1176924 -0.117,0.1163076 -0.117,0.2729078 l 0,0.7799524 q 0,0.1559078 0.117,0.2729078 0.117,0.1163076 0.272963,0.1163076 l 1.1698475,0 0,3.1195394 -1.1698475,0 q -0.1559772,0 -0.272963,0.117696 -0.117,0.116304 -0.117,0.273046 l 0,0.779815 q 0,0.156046 0.117,0.273046 0.117,0.116304 0.272963,0.116304 l 5.4592747,0 q 0.155977,0 0.272964,-0.116304 0.117,-0.116304 0.117,-0.273046 l 0,-0.779815 q 0,-0.156046 -0.117,-0.273046 -0.117,-0.117696 -0.272964,-0.117696 l -1.169848,0 0,-4.2893996 q 0,-0.1559078 -0.117,-0.2729078 -0.117,-0.1176924 -0.272963,-0.1176924 z";
}
