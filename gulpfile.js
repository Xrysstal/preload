var gulp = require('gulp'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify'),
    babel = require("gulp-babel");

gulp.task('connectSrc', function() {
  connect.server({
    root: './',
    port: 8080
  });
});

gulp.task('compress-es6', function() {
  return gulp.src('./src/js/preload-es6.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    // .pipe(concat('preload-es6.js'))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./es6-demo/'));
});


gulp.task('watch-es6', function() {
  gulp.watch('./src/js/*.js', ['compress-es6']);
});


gulp.task('es6', ['watch-es6', 'connectSrc', 'compress-es6']);