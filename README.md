`scatterD3` is an HTML R widget for interactive scatter plots visualization. It is based on the [htmlwidgets](http://www.htmlwidgets.org/) R package and on the [d3.js](http://d3js.org/) javascript library.

This is alpha software.

## Features

`scatterD3` currently provides the following features :

- Display points and text labels
- Possibility to map color and symbol with other variables (automatic legend)
- Zoom with mouse wheel, pan with mouse while zoomed in
- Ability to drag and move text labels
- Customizable tooltips when hovering points
- Points highlighting when hovering legend items


Here is a small preview of what you will get :

![example](https://raw.github.com/juba/scatterD3/master/doc/scatterD3.gif)


## Installation

Not on CRAN yet :

    devtools::install_github("juba/scatterD3")
    
## Usage

Quick example of the `scatterD3`  function based on the `mtcars` dataset :

```R
scatterD3(x = mtcars$wt, y = mtcars$mpg, lab = rownames(mtcars),
          col_var=mtcars$cyl, symbol_var = mtcars$am,
          xlab = "Weight", ylab = "Mpg", col_lab = "Cylinders",
          symbol_lab = "Manual transmission")
```
              
See [the introduction vignette](http://rpubs.com/juba/scatterD3) for a step-by-step guide and details about the different function arguments.

## Shiny integration

Like every R HTML widget, shiny integration is straightforward. Furthermore, we provide some additional
handlers to map form controls to SVG export and interactive effects (text size, points opacity and zoom reset).
You just have to give the following `id` to your form controls :

- `#scatterD3-size` : text size in points (numerical value)
- `#scatterD3-opacity` : point ant text opacity (numerical value, 0 to 1)
- `#scatterD3-resetzoom` : reset zoom to default on click
- `#scatterD3-download` : link to download the currently displayed figure as an SVG file

Here is a minimal working example :

```R
library(shiny)
runApp(shinyApp(
    ui=fluidPage(
      sidebarLayout(
        sidebarPanel(
          numericInput("scatterD3-size", "Labels size :", min = 2, max = 30, value = 10),
          numericInput("scatterD3-opacity", "Opacity :", min = 0, max = 1, value = 1, step=0.05),
          actionButton("scatterD3-resetzoom", "Reset Zoom"),
          tags$a(id="scatterD3-download", href="#", class="btn btn-default", "Download SVG")
        ),
        mainPanel(scatterD3Output("scatterPlot"))
      )
    ),
    server = function(input, output) {
      output$scatterPlot <- renderScatterD3({
        scatterD3(x=mtcars$wt,
                  y=mtcars$mpg,
                  lab=rownames(mtcars),
                  col_var=mtcars$cyl)
      })
    }
))
```

You can see the result of this [minimal scatterD3 shiny app](https://juba.shinyapps.io/scatterD3_shiny_app) hosted on shinyapps.io.

