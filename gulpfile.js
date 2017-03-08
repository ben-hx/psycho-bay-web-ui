var gulp = require('gulp');

var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var gulpCopy = require('gulp-copy');

gulp.task('default', function () {
    return gulp
        .src('src/admin/index.html')
        .pipe(usemin({
            path: __dirname,
            //asssetsDir: '../',
            //outputRelativePath: 'dist/admin/',
            js: [uglify(), rename({suffix: '.min'})],
            inlinejs: [uglify()],
            inlinecss: [minifyCss(), 'concat']
        }))
        .pipe(gulp.dest('dist/admin/'));
});