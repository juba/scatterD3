To avoid conflicts between d3v3, d3v4 and d3v5 htmlwidgets, every `d3` instances have been renamed to `d3v5`, as suggested here : https://stackoverflow.com/a/44175830

In case of d3 upgrade, we have to replace `t.d3=t.d3` by `t.d3v5=t.d3v5` at the start of `d3.min.js`.
