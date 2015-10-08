`scatterD3` is an HTML R widget for interactive scatter plots visualization. It is based on the [htmlwidgets](http://www.htmlwidgets.org/) R package and on the [d3.js](http://d3js.org/) javascript library.

## Features

`scatterD3` currently provides the following features :

- Display points and text labels
- Possibility to map color, symbol and size with other variables (automatic legend)
- Zoom with mouse wheel, pan with mouse while zoomed in
- Ability to drag and move text labels
- Customizable tooltips when hovering points
- Points highlighting when hovering legend items
- Charts integrated inside a Shiny app are fully updatable with smooth transitions when settings or data change


Here is a small preview of what you will get :

![example](https://raw.github.com/juba/scatterD3/master/resources/scatterD3.gif)


## Installation

Install from CRAN (the CRAN version is totally obsolete at the moment) :

    install_packages("scatterD3")

Or from Github for the latest, bleeding edge, full of bugs version :

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

Like every R HTML widget, shiny integration is straightforward. But as a D3 widget, `scatterD3` is *updatable* : changes in settings or data can be displayed via smooth transitions instead of a complete chart redraw, which can provide interesting visual clues.

Furthermore, `scatterD3` provides some additional handlers to two interactive features : SVG export and zoom resetting.

The
[sample scatterD3 shiny app](https://juba.shinyapps.io/scatterD3_shiny_app) hosted on shinyapps.io allows you to see the different features described here. You can [check its source code on GitHub](https://github.com/juba/scatterD3_shiny_app) and the [the introduction vignette](http://rpubs.com/juba/scatterD3) for a better understanding of the different arguments.
