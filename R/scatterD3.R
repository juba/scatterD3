#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#' @export
#'
scatterD3 <- function(x, y, lab = NULL,
                      size = NULL, labels_size = 10,
                      fixed = FALSE, var = NULL,
                      xlab = NULL, ylab = NULL, varlab = NULL,
                      width = NULL, height = NULL) {

  if (is.null(xlab)) xlab <- deparse(substitute(x))
  if (is.null(ylab)) ylab <- deparse(substitute(y))
  if (is.null(varlab)) varlab <- deparse(substitute(var))

  # create a list that contains the settings
  settings <- list(
    labels_size = labels_size,
    size = size,
    xlab = xlab,
    ylab = ylab,
    var = var,
    varlab = varlab,
    fixed = fixed
  )

  if (is.null(lab)) lab <- rep("", length(x))
  data <- data.frame(x=x, y=y, lab=lab)
  if (!is.null(var)) data <- cbind(data, var=var)

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
