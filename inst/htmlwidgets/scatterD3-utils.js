// Clean variables levels to be valid CSS classes
function css_clean(s) {
    if (s === undefined) return "";
    return s.toString().replace(/[^\w-]/g, "_");
}
