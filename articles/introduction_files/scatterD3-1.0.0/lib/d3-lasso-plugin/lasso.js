d3v7.lasso = function() {

    var items = null,
        closePathDistance = 75,
        closePathSelect = true,
        isPathClosed = false,
        hoverSelect = true,
        points = [],
        area = null,
        on = {start:function(){}, draw: function(){}, end: function(){}};

    function lasso(selection) {

        // the element where the lasso was called
        var _this = selection;

        // add a new group for the lasso
        var g = _this.append("g")
                    .attr("class","lasso");

        // add the drawn path for the lasso
        var dyn_path = g.append("path")
            .attr("class","drawn");

        // add a path used for calculations
        var calc_path = g.append("path")
            .attr("display","none");

        // add a closed path
        var close_path = g.append("path")
            .attr("class","loop_close");

        // add a close path used for calculations
        var calc_close_path = g.append("path")
            .attr("display","none");

        // add an origin node
        var origin_node = g.append("circle")
            .attr("class","origin");

        // The lasso path for calculations
        var path;

        // The transformed lasso path for rendering
        var tpath;

        // The lasso origin for calculations
        var origin;

        // The transformed lasso origin for rendering
        var torigin;

        // The last known point on the lasso during drag - needed for evaluating edges
        var last_known_point;

        // The starting point for evaluating the path
        var path_length_start;

        // Apply drag behaviors
        var drag = d3v7.drag()
            .on("start", dragstart)
            .on("drag", dragmove)
            .on("end", dragend);

	// Init DOM-local data
	var right_edges = d3v7.local();
	var left_edges = d3v7.local();
	var close_right_edges = d3v7.local();
	var close_left_edges = d3v7.local();

        // Call drag
        area.call(drag);

        function dragstart() {
            // Initialize paths
            path="";
            tpath = "";
            dyn_path.attr("d", "M0 0");
            close_path.attr("d", "M0 0");

            // Set path length start
            path_length_start = 0;
            // Set every item to have a false selection and reset their center point and counters
            items.each(function(d) {
                d.hoverSelected = false;
                d.loopSelected = false;
		// Ignore text labels for center coordinates
		if (this.tagName != "text") {
                    var box = this.getBoundingClientRect();
                    d.lassoPoint = {
			cx: Math.round(box.left + box.width/2),
			cy: Math.round(box.top + box.height/2)
                    };
		}
		right_edges.set(this, 0);
		left_edges.set(this, 0);
		close_right_edges.set(this, 0);
		close_left_edges.set(this, 0);
            });

            // if hover is on, add hover function
            if(hoverSelect===true) {
                items.on("mouseover.lasso",function() {
                    // if hovered, change lasso selection attribute to true
                    d3v7.select(this).hoverSelected = true;
                });
            }

            // Run user defined start function
            on.start();
        }

        function dragmove(event) {
            // Get mouse position within body, used for calculations
            var x = event.sourceEvent.clientX;
            var y = event.sourceEvent.clientY;
            // Get mouse position within drawing area, used for rendering
            var tx = d3v7.pointer(event, this)[0];
            var ty = d3v7.pointer(event, this)[1];

            // Initialize the path or add the latest point to it
            if (path==="") {
                path = path + "M " + x + " " + y;
                tpath = tpath + "M " + tx + " " + ty;
                origin = [x,y];
                torigin = [tx,ty];
                // Draw origin node
                origin_node
                    .attr("cx",tx)
                    .attr("cy",ty)
                    .attr("r",7)
                    .attr("display",null);
            }
            else {
                path = path + " L " + x + " " + y;
                tpath = tpath + " L " + tx + " " + ty;
            }

            // Reset closed edges counter
            items.each(function(d) {
		close_left_edges.set(this, 0);
		close_right_edges.set(this, 0);
            });

            // Calculate the current distance from the lasso origin
            var distance = Math.sqrt(Math.pow(x-origin[0],2)+Math.pow(y-origin[1],2));

            // Set the closed path line
            var close_draw_path = "M " + tx + " " + ty + " L " + torigin[0] + " " + torigin[1];

            // Set the calc closed path line
            var calc_close_draw_path = "M " + x + " " + y + " L " + origin[0] + " " + origin[1];

            // Draw the lines
            dyn_path.attr("d",tpath);

            // path for calcs
            calc_path.attr("d",path);

            calc_close_path.attr("d",calc_close_draw_path);

            // Check if the path is closed
            isPathClosed = distance<=closePathDistance ? true : false;

            // If within the closed path distance parameter, show the closed path. otherwise, hide it
            if(isPathClosed) {
                close_path.attr("display",null);
            }
            else {
                close_path.attr("display","none");
            }


            // Get path length
            var path_node = calc_path.node();
            var path_length_end = path_node.getTotalLength();
            // Get the ending point of the path
            var last_pos = path_node.getPointAtLength(path_length_start-1);

            // Iterate through each point on the path
            for (var i = path_length_start; i<=path_length_end; i++) {
                // Get the current coordinates on the path
                var cur_pos = path_node.getPointAtLength(i);
                var cur_pos_obj = {
                    x:Math.round(cur_pos.x*100)/100,
                    y:Math.round(cur_pos.y*100)/100
                };
                // Get the prior coordinates on the path
                var prior_pos = path_node.getPointAtLength(i-1);
                var prior_pos_obj = {
                    x:Math.round(prior_pos.x*100)/100,
                    y:Math.round(prior_pos.y*100)/100
                };
                // Iterate through each item
                items.filter(function(d) {
                    var a;
                    // If we are on the same y position as the item and we weren't on this y before,
                    // mark as the last known point. Return false - we don't need to count an edge yet
                    if(d.lassoPoint.cy === cur_pos_obj.y && d.lassoPoint.cy != prior_pos_obj.y) {
                        last_known_point = {
                            x: prior_pos_obj.x,
                            y: prior_pos_obj.y
                        };
                        a=false;
                    }
                    // If we are on the same y position as the item and we were on this y before,
                    // return false - we don't need to count an edge yet
                    else if (d.lassoPoint.cy === cur_pos_obj.y && d.lassoPoint.cy === prior_pos_obj.y) {
                        a = false;
                    }
                    // If we are not on the same y position as the item but we were previously,
                    // determine if we passed by the item or came up to it and turned around.
                    // Return true if we passed it so that we can evaluate for an edge
                    else if (d.lassoPoint.cy != cur_pos_obj.y && d.lassoPoint.cy === prior_pos_obj.y) {
                        a = sign(d.lassoPoint.cy-cur_pos_obj.y)!=sign(d.lassoPoint.cy-last_known_point.y);
                    }
                    // Else, mark a last known point and check for a crossing.
                    // If we crossed, we need to evaluate for edges
                    else {
                        last_known_point = {
                            x: prior_pos_obj.x,
                            y: prior_pos_obj.y
                        };
                        a = sign(d.lassoPoint.cy-cur_pos_obj.y)!=sign(d.lassoPoint.cy-prior_pos_obj.y);
                    }
                    return a;
                }).each(function(d) {
                    // Iterate through each object and add an edge to the left or right
                    if(cur_pos_obj.x>d.lassoPoint.cx) {
			right_edges.set(this, right_edges.get(this) + 1);
                    }
                    if(cur_pos_obj.x<d.lassoPoint.cx) {
			left_edges.set(this, left_edges.get(this) + 1);
                    }
                 });
            }

            // If the path is closed and close select is set to true, draw the closed paths and count edges
             if(isPathClosed === true && closePathSelect === true) {
                close_path.attr("d",close_draw_path);
                var close_path_node = calc_close_path.node();
                var close_path_length = close_path_node.getTotalLength();
                for (var i = 0; i<=close_path_length; i++) {
                    var cur_pos = close_path_node.getPointAtLength(i);
                    var prior_pos = close_path_node.getPointAtLength(i-1);

                    items.filter(function(d) {return d.lassoPoint.cy==Math.round(cur_pos.y);}).each(function(d) {
                        if(Math.round(cur_pos.y)!=Math.round(prior_pos.y) && Math.round(cur_pos.x)>d.lassoPoint.cx) {
			    close_right_edges.set(this, 1);
                        }
                        if(Math.round(cur_pos.y)!=Math.round(prior_pos.y) && Math.round(cur_pos.x)<d.lassoPoint.cx) {
			    close_left_edges.set(this, 1);
                        }
                    });

                }

                // Check and see if the points have at least one edge to the left, and an odd # of edges to the right. If so, mark as selected.
                 items.each(function(a) {
                     if((left_edges.get(this) + close_left_edges.get(this))>0 && (right_edges.get(this) + close_right_edges.get(this)) % 2 == 1) {
                        a.loopSelected = true;
                    }
                     else {
                        a.loopSelected = false;
                     }
                });
            }
            else {
                items.each(function(d) {
                    d.loopSelected = false;
                });
            }
            // Tag possible items
            items.filter(function(d) {return (d.loopSelected && isPathClosed) || d.hoverSelected;})
                .each(function(d) { d.possible = true;});

            items.filter(function(d) {return !((d.loopSelected && isPathClosed) || d.hoverSelected);})
                .each(function(d) {d.possible = false;});

            on.draw();

            // Continue drawing path from where it left off
            path_length_start = path_length_end+1;
        }

        function dragend() {
            // Remove mouseover tagging function
            items.on("mouseover.lasso",null);

            // Tag selected items
            items.filter(function(d) {return d.possible === true;})
                .each(function(d) {d.selected = true;});

            items.filter(function(d) {return d.possible === false;})
                .each(function(d) {d.selected = false;});

            // Reset possible items
            items
                .each(function(d) {d.possible = false;});

            // Clear lasso
            dyn_path.attr("d", "M0 0");
            close_path.attr("d", "M0 0");
            origin_node.attr("display","none");
            // Run user defined end function
            on.end();

        }
    }

    lasso.items  = function(_) {

        if (!arguments.length) return items;
        items = _;
        items.each(function(d) {
            var item = d3v7.select(this);
            if(typeof item.datum() === 'undefined') {
                item.datum({possible:false,selected:false});
            }
            else {
                //item.attr("d",function(e) {e.possible = false; e.selected = false; return e;});
                var e = item.datum();
                e.possible = false;
                e.selected = false;
                item.datum(e);
            }
        });
        return lasso;
    };

    lasso.closePathDistance  = function(_) {
        if (!arguments.length) return closePathDistance;
        closePathDistance = _;
        return lasso;
    };

    lasso.closePathSelect = function(_) {
        if (!arguments.length) return closePathSelect;
        closePathSelect = _===true ? true : false;
        return lasso;
    };

    lasso.isPathClosed = function(_) {
        if (!arguments.length) return isPathClosed;
        isPathClosed = _===true ? true : false;
        return lasso;
    };

    lasso.hoverSelect = function(_) {
        if (!arguments.length) return hoverSelect;
        hoverSelect = _===true ? true : false;
        return lasso;
    };

    lasso.on = function(type,_) {
        if(!arguments.length) return on;
        if(arguments.length===1) return on[type];
        var types = ["start","draw","end"];
        if(types.indexOf(type)>-1) {
            on[type] = _;
        }
        return lasso;
    };

    lasso.area = function(_) {
        if(!arguments.length) return area;
        area=_;
        return lasso;
    };

    function sign(x) {
        return x?x<0?-1:1:0;
    }


    return lasso;

};
