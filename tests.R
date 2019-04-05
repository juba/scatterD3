library(scatterD3)
mtcars$names <- rownames(mtcars)

## AUTO LABELS

devtools::install("."); scatterD3(data=mtcars, wt, mpg,
  lab=names, labels_positions="auto")

devtools::install("."); scatterD3(data=mtcars, wt, qsec,
  lab=names, labels_positions="auto")

d <- data.frame(lab = "toto", x = rnorm(100), y = rnorm(100))
devtools::install("."); scatterD3(data=d, x, y,
  lab=lab, labels_positions="auto")


