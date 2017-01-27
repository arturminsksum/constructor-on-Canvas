"use strict";

var gulp = require('gulp');

var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var path = require('path');

gulp.postcss = require('gulp-postcss');
gulp.autoprefixer = require('gulp-autoprefixer');
gulp.cssnano = require('gulp-cssnano');
gulp.cssImport = require("postcss-import");
gulp.postcssVars = require("postcss-simple-vars");
gulp.postcssMixins = require("postcss-mixins");
gulp.postcssNasted = require("postcss-nested");

var dir = './build';
var dirCss = 'dev/common.min.css';

gulp.preprocessors = [
    gulp.cssImport(dir+'/css/*.css'),
    gulp.postcssVars,
    gulp.postcssMixins,
    gulp.postcssNasted
];


gulp.task('connect', function() {
  connect.server({
    root: dir,
    fallback: dir+'/constructor.html',
    livereload: true
  });
});

gulp.task('postcss', function () {
    return gulp.src(dirCss)
        .pipe(gulp.postcss(gulp.preprocessors))
        .pipe(gulp.autoprefixer({browsers: ['last 10 versions','ie >= 9']}))
        // .pipe(gulp.cssnano())
        .pipe(gulp.dest(dir+'/css'))
        .pipe(connect.reload());
});

gulp.task('html', function () {
  gulp.src(dir+'/*.html')
    .pipe(connect.reload());
});


// gulp.task('css', function () {
//   gulp.src(dir+'/css/*.css')
//     .pipe(connect.reload());
// });

gulp.task('js', function () {
  gulp.src(dir+'/js/*.js')
    .pipe(connect.reload());
});

gulp.task('watch', function () {

    // Run both tasks on first run
    gulp.run('postcss','connect');

    gulp.watch(dir+'/*.html', function () {
        gulp.run('html');
    }); 


    // gulp.watch(dir+'/css/*.css', function () {
    //     gulp.run('css');
    // }); 

    gulp.watch(dirCss, function () {
        gulp.run('postcss');
    }); 

    gulp.watch(dir+'/js/*.js', function () {
        gulp.run('js');
    }); 

});

gulp.task('default', ['watch']);

