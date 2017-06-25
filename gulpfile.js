var gulp = require("gulp"),
    less = require("gulp-less"),
    autoprefixer = require("gulp-autoprefixer"),
    jade = require("gulp-jade"),
    minifycss = require("gulp-minify-css"),
    del = require("del");

// var destination = "//WINTERMUTE/http-server/yearly"
destination = "."
gulp.task("less", function() {
    return gulp.src("./less/style.less")
    .pipe(less())
    .pipe(autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false}))
    .pipe(minifycss())
    .pipe(gulp.dest(destination + "/stylesheets/"));
});

gulp.task("jade", function() {
    return gulp.src("./*.jade")
    .pipe(jade())
    .pipe(gulp.dest(destination));
});

gulp.task("watch", function() {
    gulp.start("less", "jade");
    gulp.watch("./less/*.less", ["less"]);
    gulp.watch("./*.jade", ["jade"]);
});

gulp.task("default", function() {
    gulp.start("less", "jade");
});
