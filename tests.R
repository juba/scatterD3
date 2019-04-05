library(scatterD3)
mtcars$names <- rownames(mtcars)
i <- function() { devtools::install() }

## AUTO LABELS

i(); scatterD3(data=mtcars, wt, mpg,
  lab=names, labels_positions="auto")

i(); scatterD3(data=mtcars, wt, qsec,
  lab=names, labels_positions="auto")

d <- data.frame(lab = "toto", x = rnorm(100), y = rnorm(100))
i(); scatterD3(data=d, x, y,
  lab=lab, labels_positions="auto")


## SIZES

i(); scatterD3(data=mtcars, wt, mpg, size_var = qsec)
i(); scatterD3(data=mtcars, wt, mpg, size_var = cyl)

sizes <- c(`4` = 10, `6` = 50, `8` = 200)
i(); scatterD3(data=mtcars, wt, mpg, size_var = cyl, sizes = sizes)
sizes <- c(`4` = 10, `6` = 50)
i(); scatterD3(data=mtcars, wt, mpg, size_var = cyl, sizes = sizes)


## OPACITIES

i(); scatterD3(data=mtcars, wt, mpg, opacity_var = cyl)
opacities <- c(`4` = 1, `6` = 0.2, `8` = 0.5)
i(); scatterD3(data=mtcars, wt, mpg, opacity_var = cyl, opacities = opacities)

opacities <- c(`4` = 1, `6` = 0.2)
i(); scatterD3(data=mtcars, wt, mpg, opacity_var = cyl, opacities = opacities)
