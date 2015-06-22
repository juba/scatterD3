#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#' @export
#'
scatterD3 <- function(x, y, lab = NULL,
                      size = NULL, labels_size = 10,
                      fixed = FALSE, col_var = NULL,
                      symbol_var = NULL,
                      col_lab = NULL, symbol_lab = NULL,
                      xlab = NULL, ylab = NULL,
                      width = NULL, height = NULL) {

  if (is.null(xlab)) xlab <- deparse(substitute(x))
  if (is.null(ylab)) ylab <- deparse(substitute(y))
  if (is.null(col_lab)) col_lab <- deparse(substitute(col_var))
  if (is.null(symbol_lab)) symbol_lab <- deparse(substitute(symbol_var))

  # create a list that contains the settings
  settings <- list(
    labels_size = labels_size,
    size = size,
    xlab = xlab,
    ylab = ylab,
    col_var = col_var,
    col_lab = col_lab,
    symbol_var = symbol_var,
    symbol_lab = symbol_lab,
    fixed = fixed
  )

  if (is.null(lab)) lab <- rep("", length(x))
  data <- data.frame(x=x, y=y, lab=lab)
  if (!is.null(col_var)) data <- cbind(data, col_var=col_var)
  if (!is.null(symbol_var)) data <- cbind(data, symbol_var=symbol_var)

  # pass the data and settings using 'x'
  x <- list(
    data = data,
    settings = settings
  )

  # create widget
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

#' Widget output function for use in Shiny
#'
#' @export
scatterD3Output <- function(outputId, width = '100%', height = '600px'){
  shinyWidgetOutput(outputId, 'scatterD3', width, height, package = 'scatterD3')
}

#' Widget render function for use in Shiny
#'
#' @export
renderScatterD3 <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, scatterD3Output, env, quoted = TRUE)
}
