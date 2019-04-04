library(scatterD3)
mtcars$names <- rownames(mtcars)

## AUTO LABELS

devtools::install("."); scatterD3(data=mtcars, wt, mpg,
  lab=names, labels_positions="auto")

devtools::install("."); scatterD3(data=mtcars, wt, qsec,
  lab=names, labels_positions="auto")

