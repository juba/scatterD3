#' Scatter plot HTML widget
#'
#' Interactive scatter plots based on htmlwidgets and d3.js
#'
#' @param data default dataset to use for plot.
#' @param x numerical vector of x values, or variable name if data is not NULL
#' @param y numerical vector of y values, or variable name if data is not NULL
#' @param x_log if TRUE, set x scale as logarithmic
#' @param y_log if TRUE, set y scale as logarithmic
#' @param lab optional character vector of text labels, or variable name if
#'     data is not NULL
#' @param point_size points size. Ignored if size_var is not NULL.
#' @param labels_size text labels size
#' @param labels_positions A data frame, as created by the
#'     "Export labels positions" menu entry, giving each label x and y
#'     position.
#' @param point_opacity points opacity, as an integer (same opacity for all
#'     points) or a vector of integers, or variable name if data is not NULL
#' @param fixed force a 1:1 aspect ratio
#' @param col_var optional vector for points color mapping, or variable name
#'     if data is not NULL
#' @param col_continuous specify if the color scale must be continuous. By
#'     default, if \code{col_var} is numeric, not a factor, and has more than
#'     6 unique values, it is considered as continuous.
#' @param colors vector of custom points colors. Colors must be defined as an
#'     hexadecimal string (eg "#FF0000"). If \code{colors} is a named list or
#'     a named vector, then the colors will be associated with their name
#'     within \code{col_var}. For a continuous color scale, can be a string giving
#'     the interpolate function name from d3-scale-chromatic (for example,
#'     "interpolatePurples")
#' @param ellipses draw confidence ellipses for points or the different color
#'     mapping groups
#' @param ellipses_level confidence level for ellipses (0.95 by default)
#' @param symbol_var optional vector for points symbol mapping, or variable
#'     name if data is not NULL
#' @param symbols vector of custom points symbols. Symbols must be defined as
#'     character strings with the following possible values : "circle", "cross",
#'     "diamond", "square", "star", "triangle", and "wye". If \code{symbols} is a
#'     named list or a named vector, then the symbols will be associated with their
#'     name within \code{symbol_var}.
#' @param size_var optional vector for points size mapping, or variable name
#'     if data is not NULL
#' @param size_range numeric vector of length 2, giving the minimum and
#'     maximum point sizes when mapping with size_var
#' @param col_lab color legend title
#' @param symbol_lab symbols legend title
#' @param size_lab size legend title
#' @param key_var optional vector of rows ids, or variable name if data is not
#'     NULL. This is passed as a key to d3, and is only added in shiny apps
#'     where displayed rows are filtered interactively.
#' @param type_var optional vector of points type : "point" for adot
#'     (default), "arrow" for an arrow starting from the origin.
#' @param opacity_var optional vector of points opacity (values between 0 and
#'     1)
#' @param url_var optional vector of URLs to be opened when a point is clicked
#' @param unit_circle set tot TRUE to draw a unit circle
#' @param tooltips logical value to display tooltips when hovering points
#' @param tooltip_text optional character vector of tooltips text
#' @param tooltip_position the tooltip position relative to its point. Must a
#'     combination of "top" or "bottom" with "left" or "right" (default is
#'     "bottom right").
#' @param xlab x axis label
#' @param ylab y axis label.
#' @param axes_font_size font size for axes text (any CSS compatible value)
#' @param legend_font_size font size for legend text (any CSS compatible
#'     value)
#' @param hover_size factor for changing size when hovering points
#' @param hover_opacity points opacity when hovering
#' @param xlim numeric vector of length 2, manual x axis limits
#' @param ylim numeric vector of length 2, manual y axis limits
#' @param menu wether to display the tools menu (gear icon)
#' @param lasso logical value to add
#'     {https://github.com/skokenes/D3-Lasso-Plugin}{d3-lasso-plugin} feature
#' @param lasso_callback the body of a JavaScript callback function with the
#'     argument \code{sel} to be applied to a lasso plugin selection
#' @param click_callback the body of a JavaScript callback function whose
#'     inputs are html_id, and the index of the clicked element.
#' @param zoom_callback the body of a JavaScript callback function whose
#'     inputs are the new xmin, xmax, ymin and ymax after a zoom action is
#'     triggered.
#' @param disable_wheel if TRUE, disable zooming with mousewheel.
#' @param lines a data frame with at least the \code{slope} and
#'     \code{intercept} columns, and as many rows as lines to add to
#'     scatterplot. Style can be added with \code{stroke}, \code{stroke_width}
#'     and \code{stroke_dasharray} columns. To draw a vertical line, pass
#'     \code{Inf} as \code{slope} value.
#' @param html_id manually specify an HTML id for the svg root node. A random
#'     one is generated by default.
#' @param dom_id_reset_zoom HTML DOM id of the element to bind the
#'     "reset zoom" control to.
#' @param dom_id_svg_export HTML DOM id of the element to bind the
#'     "svg export" control to.
#' @param dom_id_lasso_toggle HTML DOM id of the element to bind the
#'     "toggle lasso" control to.
#' @param transitions if TRUE, data updates are displayed with smooth
#'     transitions, if FALSE the whole chart is redrawn. Only used within
#'     shiny apps.
#' @param legend_width legend area width, in pixels. Set to 0 to disable
#'     legend completely.
#' @param left_margin margin on the left of the plot, in pixels
#' @param caption caption to be displayed when clicking on the corresponding
#'     icon. Either a character string, or a list with title, subtitle and
#'     text elements.
#' @param width figure width, computed when displayed
#' @param height figure height, computed when displayed
#'
#' @description Generates an interactive scatter plot based on d3.js.
#' Interactive features include zooming, panning, text labels moving, tooltips,
#' fading effects in legend. Additional handlers are provided to change label
#' size, point opacity or export the figure as an SVG file via HTML form controls.
#'
#' @author Julien Barnier <julien.barnier@@ens-lyon.fr>
#'
#' @source
#' D3.js was created by Michael Bostock. See \url{http://d3js.org/}
#'
#' @examples
#' scatterD3(x = mtcars$wt, y = mtcars$mpg, data=NULL, lab = rownames(mtcars),
#'           col_var = mtcars$cyl, symbol_var = mtcars$am,
#'           xlab = "Weight", ylab = "Mpg", col_lab = "Cylinders",
#'           symbol_lab = "Manual transmission", html_id = NULL)
#'
#' @importFrom ellipse ellipse
#' @importFrom stats cov
#' @importFrom htmlwidgets JS
#' @export

scatterD3 <- function(x, y, data = NULL, lab = NULL,
                      x_log = FALSE, y_log = FALSE,
                      point_size = 64, labels_size = 10,
                      labels_positions = NULL,
                      point_opacity = 1,
                      hover_size = 1,
                      hover_opacity = NULL,
                      fixed = FALSE,
                      col_var = NULL,
                      col_continuous = NULL,
                      colors = NULL,
                      ellipses = FALSE,
                      ellipses_level = 0.95,
                      symbol_var = NULL,
                      symbols = NULL,
                      size_var = NULL,
                      size_range = c(10,300),
                      col_lab = NULL, symbol_lab = NULL,
                      size_lab = NULL,
                      key_var = NULL,
                      type_var = NULL,
                      opacity_var = NULL,
                      unit_circle = FALSE,
                      url_var = NULL,
                      tooltips = TRUE,
                      tooltip_text = NULL,
                      tooltip_position = "bottom right",
                      xlab = NULL, ylab = NULL,
                      html_id = NULL,
                      width = NULL, height = NULL,
                      legend_width = 150,
                      left_margin = 30,
                      xlim = NULL, ylim = NULL,
                      dom_id_reset_zoom = "scatterD3-reset-zoom",
                      dom_id_svg_export = "scatterD3-svg-export",
                      dom_id_lasso_toggle = "scatterD3-lasso-toggle",
                      transitions = FALSE,
                      menu = TRUE,
                      lasso = FALSE,
                      lasso_callback = NULL,
                      click_callback = NULL,
                      zoom_callback = NULL,
                      disable_wheel = FALSE,
                      lines = data.frame(slope = c(0, Inf),
                                         intercept = c(0, 0),
                                         stroke_dasharray = c(5,5)),
                      axes_font_size = "100%",
                      legend_font_size = "100%",
                      caption = NULL) {

    ## Variable names as default labels
    if (is.null(xlab)) xlab <- deparse(substitute(x))
    if (is.null(ylab)) ylab <- deparse(substitute(y))
    if (is.null(col_lab)) col_lab <- deparse(substitute(col_var))
    if (is.null(symbol_lab)) symbol_lab <- deparse(substitute(symbol_var))
    if (is.null(size_lab)) size_lab <- deparse(substitute(size_var))
    opacity_lab <- deparse(substitute(opacity_var))
    if (is.null(html_id)) html_id <- paste0("scatterD3-", paste0(sample(LETTERS, 8, replace = TRUE), collapse = ""))

    ## NSE
    if (!is.null(data)) {
        null_or_name <- function(varname) {
            if (varname != "NULL") return(data[, varname])
            else return(NULL)
        }
        ## Get variable names
        x <- data[, deparse(substitute(x))]
        y <- data[, deparse(substitute(y))]
        lab <- deparse(substitute(lab))
        col_var <- deparse(substitute(col_var))
        size_var <- deparse(substitute(size_var))
        symbol_var <- deparse(substitute(symbol_var))
        opacity_var <- deparse(substitute(opacity_var))
        url_var <- deparse(substitute(url_var))
        key_var <- deparse(substitute(key_var))
        ## Get variable data if not "NULL"
        lab <- null_or_name(lab)
        col_var <- null_or_name(col_var)
        size_var <- null_or_name(size_var)
        symbol_var <- null_or_name(symbol_var)
        opacity_var <- null_or_name(opacity_var)
        url_var <- null_or_name(url_var)
        key_var <- null_or_name(key_var)
    }

    x_categorical <- is.factor(x) || !is.numeric(x)
    y_categorical <- is.factor(y) || !is.numeric(y)

    ## No negative values and no 0 lines if logarithmic scales
    if (x_log) {
        if (any(x <= 0))
            stop("Logarithmic scale and negative values in x")
        lines <- lines[!(lines$slope == 0 & lines$intercept == 0),]
    }
    if (y_log) {
        if (any(y <= 0))
            stop("Logarithmic scale and negative values in y")
        lines <- lines[!(lines$slope == Inf & lines$intercept == 0),]
    }

    ## colors can be named
    ##  we'll need to convert named vector to a named list
    ##  for the JSON conversion
    if (!is.null(colors) && !is.null(names(colors))) {
        colors <- as.list(colors)
        if (!setequal(names(colors), unique(col_var))) warning("Set of colors and col_var values do not match")
    }
    ## Idem for symbols
    if (!is.null(symbols) && !is.null(names(symbols))) {
        symbols <- as.list(symbols)
        if (!setequal(names(symbols), unique(symbol_var))) warning("Set of symbols and symbol_var values do not match")
    }

    ## Determine from the data if we have a continuous or ordinal color scale
    if (is.null(col_continuous)) {
        col_continuous <- FALSE
        if (!is.factor(col_var) && is.numeric(col_var) && length(unique(col_var)) > 6) {
            col_continuous <- TRUE
        }
    }

    ## If caption is a character string, convert it to a list
    if (is.character(caption)) {
        caption <- list(text = caption)
    }

    ## Tooltip position
    tooltip_position_x <- gsub("^.* ([a-z]+) *$", "\\1", tooltip_position)
    tooltip_position_y <- gsub("^ *([a-z]+) .*$", "\\1", tooltip_position)
    if (!(tooltip_position_x %in% c("left", "right")) ||
        !(tooltip_position_y %in% c("top", "bottom"))) {
        warning("tooltip_position must be a combination of 'top' or 'bottom' and 'left' or 'right'.")
        tooltip_position_x <- "right"
        tooltip_position_y <- "bottom"
    }

    ## data element
    data <- data.frame(x = x, y = y)
    col_levels <- NULL
    symbol_levels <- NULL
    if (!is.null(lab)) data <- cbind(data, lab = lab)
    if (!is.null(col_var) && !col_continuous) {
        # Keep order of levels if factor
        if (is.factor(col_var)) col_levels <- levels(col_var)
        col_var <- as.character(col_var)
        col_var[is.na(col_var)] <- "NA"
        data <- cbind(data, col_var = col_var)
    }
    if (!is.null(col_var) && col_continuous) {
        if (any(is.na(col_var))) warning("NA values in continuous col_var. Values set to min(0, col_var)")
        col_var[is.na(col_var)] <- min(0, col_var, na.rm = TRUE)
        data <- cbind(data, col_var = col_var)
    }
    if (!is.null(symbol_var)) {
        # Keep order of levels if factor
        if (is.factor(symbol_var)) symbol_levels <- levels(symbol_var)
        symbol_var <- as.character(symbol_var)
        symbol_var[is.na(symbol_var)] <- "NA"
        data <- cbind(data, symbol_var = symbol_var)
    }
    if (!is.null(size_var)) {
        if (any(is.na(size_var))) warning("NA values in size_var. Values set to min(0, size_var)")
        size_var[is.na(size_var)] <- min(0, size_var, na.rm = TRUE)
        data <- cbind(data, size_var = size_var)
    }
    if (!is.null(type_var)) data <- cbind(data, type_var = type_var)
    if (!is.null(url_var)) {
        url_var[is.na(url_var)] <- ""
        data <- cbind(data, url_var = url_var)
        if (!is.null(click_callback)) {
            click_callback <- NULL
            warning("Both url_var and click_callback defined, click_callback set to NULL")
        }
    }
    if (!is.null(opacity_var)) data <- cbind(data, opacity_var = opacity_var)
    if (!is.null(key_var)) {
        data <- cbind(data, key_var = key_var)
    }  else {
        data <- cbind(data, key_var = seq_along(x))
    }
    if (!is.null(tooltip_text)) data <- cbind(data, tooltip_text = tooltip_text)

    ## Compute confidence ellipses point positions with ellipse::ellipse.default()
    compute_ellipse <- function(x, y, level = ellipses_level, npoints = 50) {
        cx <- mean(x)
        cy <- mean(y)
        data.frame(ellipse::ellipse(stats::cov(cbind(x,y)), centre = c(cx, cy), level = level, npoints = npoints))
    }

    ## Compute ellipses points data
    ellipses_data <- list()
    if (ellipses && !col_continuous && !x_categorical && !y_categorical) {
        ## Only one ellipse
        if (is.null(col_var)) {
            ell <- compute_ellipse(x, y)
            ellipses_data <- append(ellipses_data, list(list(level = "_scatterD3_all", data = ell)))
        } else {
            ## One ellipse per col_var level
            for (l in unique(col_var)) {
                sel <- col_var == l & !is.na(col_var)
                if (sum(sel) > 2) {
                    tmpx <- x[sel]
                    tmpy <- y[sel]
                    ell <- compute_ellipse(tmpx, tmpy)
                    ellipses_data <- append(ellipses_data, list(list(level = l, data = ell)))
                }
            }
        }
    } else {
        ## Force no ellipses if continuous color or categorical variable
        ellipses <- FALSE
    }

    ## List of hashes for each data variable, to track which data elements changed
    ## to apply updates and transitions in shiny app.
    hashes <- list()
    if (transitions) {
        for (var in c("x", "y", "lab", "key_var", "col_var", "symbol_var", "size_var", "ellipses_data", "opacity_var", "lines")) {
            hashes[[var]] <- digest::digest(get(var), algo = "sha256")
        }
    }

    ## create a list that contains the settings
    settings <- list(
        x_log = x_log,
        y_log = y_log,
        labels_size = labels_size,
        labels_positions = labels_positions,
        point_size = point_size,
        point_opacity = point_opacity,
        hover_size = hover_size,
        hover_opacity = hover_opacity,
        xlab = xlab,
        ylab = ylab,
        has_labels = !is.null(lab),
        col_lab = col_lab,
        col_continuous = col_continuous,
        col_levels = col_levels,
        colors = colors,
        ellipses = ellipses,
        ellipses_data = ellipses_data,
        symbol_lab = symbol_lab,
        symbol_levels = symbol_levels,
        symbols = symbols,
        size_range = size_range,
        size_lab = size_lab,
        opacity_lab = opacity_lab,
        unit_circle = unit_circle,
        has_color_var = !is.null(col_var),
        has_symbol_var = !is.null(symbol_var),
        has_size_var = !is.null(size_var),
        has_opacity_var = !is.null(opacity_var),
        has_url_var = !is.null(url_var),
        has_legend = !is.null(col_var) || !is.null(symbol_var) || !is.null(size_var),
        has_tooltips = tooltips,
        tooltip_text = tooltip_text,
        tooltip_position_x = tooltip_position_x,
        tooltip_position_y = tooltip_position_y,
        has_custom_tooltips = !is.null(tooltip_text),
        click_callback = htmlwidgets::JS(click_callback),
        zoom_callback = htmlwidgets::JS(zoom_callback),
        disable_wheel = disable_wheel,
        fixed = fixed,
        legend_width = legend_width,
        left_margin = left_margin,
        html_id = html_id,
        xlim = xlim,
        ylim = ylim,
        x_categorical = x_categorical,
        y_categorical = y_categorical,
        menu = menu,
        lasso = lasso,
        lasso_callback = htmlwidgets::JS(lasso_callback),
        dom_id_reset_zoom = dom_id_reset_zoom,
        dom_id_svg_export = dom_id_svg_export,
        dom_id_lasso_toggle = dom_id_lasso_toggle,
        transitions = transitions,
        axes_font_size = axes_font_size,
        legend_font_size = legend_font_size,
        caption = caption,
        lines = lines,
        hashes = hashes
    )

    ## pass the data and settings using 'x'
    x <- list(
        data = data,
        settings = settings
    )

    ## create widget
    htmlwidgets::createWidget(
                     name = 'scatterD3',
                     x,
                     width = width,
                     height = height,
                     package = 'scatterD3',
                     sizingPolicy = htmlwidgets::sizingPolicy(
                                                     browser.fill = TRUE,
                                                     viewer.fill = TRUE
                                                 )
                 )
}

#' @rdname scatterD3-shiny
#' @export
scatterD3Output <- function(outputId, width = '100%', height = '600px'){
    htmlwidgets::shinyWidgetOutput(outputId, 'scatterD3', width, height, package = 'scatterD3')
}

#' @rdname scatterD3-shiny
#' @export
renderScatterD3 <- function(expr, env = parent.frame(), quoted = FALSE) {
    if (!quoted) { expr <- substitute(expr) } # force quoted
    htmlwidgets::shinyRenderWidget(expr, scatterD3Output, env, quoted = TRUE)
}




