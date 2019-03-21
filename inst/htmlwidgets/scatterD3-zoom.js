
// Init and returns a zoom behavior
function zoom_behavior(root, settings, zoomed) {

    var viewport = root.select(".viewport");

    var root_bb = root.node().getBoundingClientRect();
    var viewport_bb = viewport.node().getBoundingClientRect();

    var x0 = viewport_bb.left - root_bb.left;
    var y0 = viewport_bb.top - root_bb.top;
    var x1 = viewport_bb.right - root_bb.left;
    var y1 = viewport_bb.bottom - root_bb.top;

    // Zoom behavior
    var zoom = d3v5.zoom()
                .extent([[0, y0], [x1 - x0, y1]])
                .scaleExtent([0, 32])
                .on("zoom", zoomed);

    if (settings.disable_wheel) {
        root.on("wheel.zoom", null)
    }    

    return zoom;
}