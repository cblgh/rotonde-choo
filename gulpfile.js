var gulp = require("gulp"),
    less = require("gulp-less"),
    autoprefixer = require("gulp-autoprefixer"),
    minifycss = require("gulp-minify-css"),
    del = require("del");

var destination = "."
gulp.task("less", function() {
    return gulp.src("./less/style.less")
    .pipe(less())
    .pipe(autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false}))
    .pipe(minifycss())
    .pipe(gulp.dest(destination + "/stylesheets/"));
});

gulp.task("watch", function() {
    gulp.start("less");
    gulp.watch("./less/*.less", ["less"]);
});

gulp.task("default", function() {
    gulp.start("less");
});
