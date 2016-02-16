`scatterD3` is an HTML R widget for interactive scatter plots visualization. It is based on the [htmlwidgets](http://www.htmlwidgets.org/) R package and on the [d3.js](http://d3js.org/) javascript 
library.

![CRAN Downloads](http://cranlogs.r-pkg.org/badges/last-month/scatterD3) 
[![Travis-CI Build Status](https://travis-ci.org/juba/scatterD3.svg?branch=master)](https://travis-ci.org/juba/scatterD3)
[![CRAN_Status_Badge](http://www.r-pkg.org/badges/version/scatterD3)](http://cran.r-project.org/package=scatterD3)

## Features

`scatterD3` currently provides the following features :

- Display points and text labels
- Possibility to map color, symbol and size with other variables (automatic legend)
- Zoom with mouse wheel, pan with mouse while zoomed in
- Ability to drag and move text labels
- Customizable tooltips when hovering points
- Points highlighting when hovering legend items
- Option to draw confidence ellipses around group of points
- Charts integrated inside a Shiny app are fully updatable with smooth transitions when settings or data change
- Lasso selection tool integration via d3-lasso-plugin for points highlighting


Here is a small preview of what you will get :

![example](https://raw.github.com/juba/scatterD3/master/resources/scatterD3.gif) 

You can also test it live with the [sample shiny app](http://data.nozav.org/app/scatterD3/).


## Installation

Install latest stable release from CRAN :

    install.packages("scatterD3")

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
              
See [the introduction vignette](https://rawgit.com/juba/scatterD3/master/vignettes%2Fintroduction.html) for a step-by-step guide and details about the different function arguments.

## Shiny integration

Like every R HTML widget, shiny integration is straightforward. But as a D3 widget, `scatterD3` is *updatable* : changes in settings or data can be displayed via smooth transitions instead of a complete chart redraw, which can provide interesting visual clues.

Furthermore, `scatterD3` provides some additional handlers to two interactive features : SVG export and zoom resetting.

The
[sample scatterD3 shiny app](http://data.nozav.org/app/scatterD3/) allows you to see the different features described here. You can [check its source code on GitHub](https://github.com/juba/scatterD3_shiny_app) and the [introduction vignette](https://rawgit.com/juba/scatterD3/master/vignettes%2Fintroduction.html) for a better understanding of the different arguments.


## Credits

This package has been made possible by :

- Michael Bostock's incredible [d3.js](https://d3js.org/) library and documentation
- RStudio's [shiny](http://shiny.rstudio.com/) and [htmlwidgets](http://www.htmlwidgets.org/) packages
- Susie Lu's [d3-legend](https://github.com/susielu/d3-legend) module
- Rob Moore's [article on reusable d3.js charts](http://www.toptal.com/d3-js/towards-reusable-d3-js-charts)
- Speros Kokenes' [d3 lasso plugin](https://github.com/skokenes/D3-Lasso-Plugin)



