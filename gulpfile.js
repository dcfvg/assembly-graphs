const gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var browserSync = require('browser-sync').create();

gulp.task('less', function() {
    return gulp.src('./assets/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('./assets/css'));
});

gulp.task('build-js', function() {
    return gulp.src([
      './bower_components/jquery/dist/jquery.js',
      './bower_components/lodash/lodash.js',
      './bower_components/handlebars/handlebars.min.js',
      './bower_components/d3/d3.min.js',
      './node_modules/d3-selection-multi/build/d3-selection-multi.js',
      './bower_components/papaparse/papaparse.min.js',
      './bower_components/moment/min/moment.min.js',
      './bower_components/file-saver/FileSaver.min.js',

      ],
      {base: 'bower_components/'}
    )
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./assets/js/'));
});

gulp.task('watch', function() {
});

gulp.task('serve', function() {
    browserSync.init({ server: "./" });

    gulp.watch('./assets/less/*.less', ['less']);
    gulp.watch('./templates/*.hbs', ['templates']);

    gulp.watch("./assets/less/*.less").on('change', browserSync.reload);
    gulp.watch("./templates/*.hbs").on('change', browserSync.reload);
    gulp.watch("./*.html").on('change', browserSync.reload);
});
// copy fonts
gulp.task('fonts', function() {
  return gulp.src(['./bower_components/bootstrap/dist/fonts/*.*'])
          .pipe(gulp.dest('./assets/fonts/'));
});

gulp.task('templates', function(){
  gulp.src('./templates/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'fac',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('assets/js/'));
});


gulp.task('default', [ 'build-js', 'less', 'watch', 'fonts']);
