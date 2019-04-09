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

d <- data.frame(lab = "toto", x = rnorm(501), y = rnorm(501))
i(); scatterD3(data=d, x, y, lab=lab, labels_positions="auto")

  d <- data.frame(lab = c(rep("toto", 100), rep("", 401)), x = rnorm(501), y = rnorm(501))
  i(); scatterD3(data=d, x, y, lab=lab, labels_positions="auto")



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


## ARROWS

df <- data.frame(x= runif(5) - 0.5, y = runif(5) - 0.5, lab = "toto")
i(); scatterD3(x=df$x, y=df$y, lab=df$lab, type_var = rep("arrow", 5))


## LEGENDS

i(); scatterD3(data=mtcars, wt, mpg, col_var = cyl, col_lab = NA)

i(); scatterD3(data=mtcars, wt, mpg, col_var = cyl, size_var = qsec, size_lab = NA)

df <- mtcars
df$cyl[df$cyl==4] <- ""
i(); scatterD3(data=df, wt, mpg, col_var = cyl)



