library(scatterD3)

scatterD3(c(267,239),c("a1","a2"),lab = c("b","c"), lines = data.frame(slope = Inf, intercept = c(245, 248)))

devtools::install(".") ; scatterD3(x = mtcars$wt, y = mtcars$mpg, col_var = mtcars$cyl, symbol_var = mtcars$gear, colors=c("#FF0000", "#00FF00", "#0000FF"), zoom_on_level = 10, zoom_on = c(5,13), unit_circle = TRUE)

scatterD3(x = mtcars$wt, y = mtcars$mpg, col_var = mtcars$cyl, disable_wheel = TRUE)

devtools::install(".") ; scatterD3(x = mtcars$wt, y = mtcars$mpg, lab = rownames(mtcars), col_var = mtcars$cyl, caption = "Toto", unit_circle = TRUE, lasso = TRUE)


scatterD3(x = mtcars$wt, y = mtcars$mpg, col_var = mtcars$qsec, colors = "interpolatePurples")

scatterD3(x = mtcars$wt, y = mtcars$mpg, col_var = mtcars$cyl, colors = "schemeTableau10")

mtcars$id <- seq_len(nrow(mtcars))
mtcars$name <- rownames(mtcars)
mtcars$opacity <- runif(32)
mtcars$drat[1] <- NA
detach(package:scatterD3, unload=TRUE); library(scatterD3)
scatterD3(data = mtcars, x = hp, y = mpg, col_var = cyl, symbol_var = gear, lab = name, x_log = TRUE, y_log = TRUE)

detach(package:scatterD3, unload=TRUE); library(scatterD3)
mtcars$nimp <- factor(sample(1:13, nrow(mtcars), replace=TRUE))
scatterD3(data = mtcars, x = wt, y = mpg, col_var = nimp, symbol_var = gear, lab = name, x_log = TRUE, y_log = TRUE)

detach(package:scatterD3, unload=TRUE); library(scatterD3)
scatterD3(data = mtcars, x = wt, y = mpg, col_var = cyl, symbol_var = gear, lab = name)

mtcars$name <- rownames(mtcars)
devtools::install(".") ; scatterD3(data = mtcars, x = hp, y = mpg, lab = name, labels_positions = "auto")

devtools::install(".") ; df <- data.frame(x=runif(200), y=runif(200), lab=sample(LETTERS, 200, replace = TRUE)) ; scatterD3(data = df, x = x, y = y, lab = lab, labels_positions = "auto")



  library(magrittr)
mtcars %>% scatterD3(x = wt, y = mpg, data = .)

mtcars$url <- paste0("http://www.google.fr/?q=", rownames(mtcars))
scatterD3(data = mtcars, x = wt, y = mpg, lab = name, tooltips = TRUE,
          hover_opacity = 0.1, hover_size = 10,
          click_callback = "function(id, index) {
   alert('scatterplot ID: ' + id + ' - Point index: ' + index)
   }")

mtcars$id <- 1:seq_len(nrow(mtcars))
scatterD3(data = mtcars,
          x = wt, y = mpg, key_var = id,
          lasso = TRUE,
          lasso_callback = "function(sel) {alert(sel.data().map(function(d) {return d.key_var}).join('\\n'));}")

library(scatterD3)
scatterD3(data.frame(x=rnorm(100000),y=rnorm(100000)), x = x, y = y)


## Legend order

mtcars$group <- factor(c(1:11,1:11,1:10))
mtcars$name <- rownames(mtcars)
detach(package:scatterD3, unload=TRUE); library(scatterD3)
scatterD3(data = mtcars, x = mpg, y = wt, col_var=group, lab = name)

mtcars$group <- c(1:11,1:11,1:10)
mtcars$name <- rownames(mtcars)
detach(package:scatterD3, unload=TRUE); library(scatterD3)
scatterD3(data = mtcars, x = mpg, y = wt, col_var=group, lab = name)

mtcars$group <- sample(LETTERS[1:3], nrow(mtcars), replace = TRUE)
scatterD3(data = mtcars, x = mpg, y = wt, col_var=group, lab = name)
scatterD3(data = mtcars, x = mpg, y = wt, symbol_var=group, lab = name)
## Réordonnancement de mtcars$group
mtcars$group <- factor(mtcars$group, levels=c("B", "A", "C"))
scatterD3(data = mtcars, x = mpg, y = wt, col_var=group, lab = name)
scatterD3(data = mtcars, x = mpg, y = wt, symbol_var=group, lab = name)

## Symbol mapping

scatterD3(data = mtcars, x = wt, y = mpg, col_var = cyl,
          colors = c("4" = "#ECD078", "8" = "#C02942", "6" = "#53777A"))
scatterD3(data = mtcars, x = wt, y = mpg, symbol_var = cyl)
scatterD3(data = mtcars, x = wt, y = mpg, symbol_var = cyl, symbols = "wye")
scatterD3(data = mtcars, x = wt, y = mpg, symbol_var = cyl,
          symbols = c("4" = "wye", "8" = "star", "6" = "square"))
scatterD3(data = mtcars, x = wt, y = mpg, symbol_var = cyl, symbols=c("square", "star", "wye"))
mtcars$cyl_o <- factor(mtcars$cyl, levels=c("8", "6", "4"))
scatterD3(data = mtcars, x = wt, y = mpg, symbol_var = cyl_o, symbols=c("square", "star", "wye"))

## Tooltips

scatterD3(data = mtcars, x = wt, y = mpg, tooltip_text = "<div style='width:300px;font-size:150%;opacity:0.1 !important'>Test test</div>", tooltip_position = "left")
scatterD3(data = mtcars, x = wt, y = mpg, tooltip_position = "bottom right")
scatterD3(data = mtcars, x = wt, y = mpg, tooltip_position = "top right")
scatterD3(data = mtcars, x = wt, y = mpg, tooltip_position = "   bottom   left ")
scatterD3(data = mtcars, x = wt, y = mpg, tooltip_position = "top left")

## Callback

scatterD3(data = mtcars, x = wt, y = mpg,
  init_callback = "function() {
    var scales = this.scales();
    var svg = this.svg();
    new_x_axis = scales.xAxis.tickFormat(d3v5.format(',.0%'));
    svg.select('.x.axis').call(new_x_axis);
  }"
)


