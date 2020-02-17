# scatterD3 0.9.1

* New `init_callback` argument for (undocumented) callback on scatter object after init or update
* Bugfix : ** operator not working in Safari / old RStudio
* Bugfix : NS_ERROR_FAILURE with getBBox in labels

# scatterD3 0.9.0

* Qualitative color palettes between 10 and 12 items now use ColorBrewer's schemePaired
* Upgrade to d3 5.9.2 (with version conflicts patch)
* Add documentation website with pkgdown
* Keep the order of levels in legend if col_var or symbol_var is a factor (thanks @romanhaa)
* Add `symbols` argument and custom symbol to value mapping (thanks @GiuseppeDiGuglielmo and @mmauri)
* New `tooltip_position` argument to define tooltip placement (thanks @Tixierae)
* Add `disable_wheel` argument to disable mousewheel zooming (thanks @romanhaa)
* Add `colors` argument for continuous color variables (thanks @romanhaa)
* Add `zoom_on` and `zoom_on_level` arguments for programmatic zooming (thanks @Tixierae)
* Permanent lines between dot and labels above a certain distance
* Add small white outline around labels
* Add ability to specify custom values <=> sizes or opacities
* Ignore empty "" domain values in legends
* Don't show legend if it's corresponding _lab value is NA
* First try at automatic label placement with `labels_positions = "auto"`
* Complete code refactoring


# scatterD3 0.8.2


* Rename every d3 to d3v4 to avoid conflicts with other d3v3 htmlwidgets
* Bugfix : zoom not working in RStudio (again)
* Upgrade to d3 4.13.0 without patch for zoom-related problem


# scatterD3 0.8.1


* Bugfix : categorical axes labels shown as NaN (thanks @zji90)
* Bugfix : plot not centered when fixed = TRUE (thanks @jon-nagra)
* Bugfix : incorrect plot when only one point (thanks @CUinNYC)
* Bugfix : xlim and ylim not taken into account when updating chart (thanks @CUinNYC)
* Bugfix : plot with no data should return an empty plot, not an error
* Bugfix : tick marks must be put below axes labels


# scatterD3 0.8

* New "caption" argument to add a toggable caption to the plot
* New "x_log" and "y_log" arguments for x and y logarithmic scales
* New argument `labels_positions`, allows to import a previously saved labels positions file
* Toggle "export labels position" visibility when labels change
* Bugfix : incoherent data on mouseover after data updating
* Bugfix : unable to export SVG when text contains non-Latin1 characters


# scatterD3 0.7

* Upgrade to d3v4
* Add `data` argument to specify variables from a data frame with NSE
* New menu accessible directly from the graph to allow zoom resetting, SVG export, etc.
* Continuous color scales are now supported. They are automatically guessed from `col_var` characteristics, but can be forced with the `col_continuous` argument.
* Categorical variables are now allowed for `x` and `y`.
* New `lines` argument to add custom lines to the plot
* New argument : `opacity_var` to specify points opacity individually with a vector. Use `point_opacity` to specify a constant opacity.
* New argument : `url_var` to specify URLs to be opened when a point is clicked.
* Add `click_callback` parameter, opening a hook for a click event listener (thanks @detule and @harveyl888)
* Add `zoom_callback` parameter, opening a hook for a zoom event listener
* New "export labels position" feature
* New settings `hover_size` and `hover_opacity` (thanks @nicolabo)
* Axes and legend font size customization with `axes_font_size` and `legend_font_size` (thanks @fineswag)
* Better legend transitions when updating
* JavaScript code split into several subfiles
* Left margin customization with the `left_margin` argument
* More precise font-family specification for (hopefully) better rendering
* Bugfix : blank plot when only one color passed to `colors` (thanks @chewth)


# scatterD3 0.6.2

* Darker points color during lasso selection
* Bugfix : Remove any previous anchor from clip-path urls
* Bugfix : deal with NA in size_var


# scatterD3 0.6.1

* New feature : d3 lasso plugin integration, initial work by @timelyportfolio
* New feature : allow to draw confidence ellipses for all points or for col_var groups
* Bugfix : underscores appearing instead of spaces in legend text (thanks @TimBock)
* Bugfix : xlim and ylim not taken ignored when fixed = TRUE (thanks @TimBock)
* Bugfix : legend must not be displayed when legend_width = 0 and fixed = TRUE (thanks @TimBock)
* Bugfix : wrong legend hover highlighting when the label is "0"
* Bugfix : convert NA to "NA" in color and symbol mapping variables


# scatterD3 0.5.1

* Fix zoom reset when several charts in the same shiny app
* Switch to 20 colors ordinary scales if there are more than 10 color variable levels
* Bugfix : wrong svg reference passed to hover legend functions when several scatterD3 instances in the same shiny app
* Make point labels updatable
* Manage changes of unit_circle settings


# scatterD3 0.5


* Bugfixes for when several scatterD3 instances are in the same shiny app
* Fix `fixed` 1:1 aspect ratio not working as intended
* New `unit_circle` argument to draw a unit circle around origin
* Text labels are placed below the corresponding arrow by default when y < 0
* New `type_var` argument, which allows to selectively draw arrows (starting from origin) instead of points


# scatterD3 0.4


* A temporary line is drawn between text and point when dragging a label
* Fix plots updating when several widgets are in the same shiny app
* Fix tooltips not showing in Firefox
* Fix clip-path URL problems when exporting to SVG


# scatterD3 0.3


* Charts integrated into a shiny app are now fully updatable : when data or settings change, the plot is updated with smooth transitions instead of being redrawn. See the `transitions` and `key_var` arguments.
* HTML DOM id of elements linked to the "Reset zoom" and "Export to SVG" features can now be given as arguments.


# scatterD3 0.2


* Add `colors` argument to specify a custom set of point colors. A named vector can be used to directly map values to colors (Thanks @timelyportfolio)
* Complete code reorganisation, much cleaner
* New `legend_width` argument
* Use `d3-legend` plugin for legend generation (http://d3-legend.susielu.com/)
* New `xlim` and `ylim` arguments for manual axis limits specification (Thanks @tinyheero)
* Fix tooltips not showing under Shiny/Bootstrap (Thanks @tinyheero for reporting)
* Fix tooltip content when several scatter plots are displayed on the same page
* Respect custom label position when zooming


# scatterD3 0.1.1

* First version
