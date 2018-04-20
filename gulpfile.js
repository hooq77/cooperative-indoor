'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var changed = require('gulp-changed');
var plumer = require('gulp-plumber');
var Server = require('karma').Server;

gulp.task('default', function () {
  console.log('our first gulp task');
});

gulp.task('jshint', function() {
  return gulp.src('./server/**/*.js') // 检查文件：js目录下所有的js文件
    .pipe(jshint())  // 进行检查
    .pipe(jshint.reporter('default'));// 对代码进行报错提示
});

gulp.task('compress',['changed'], function() {
  return gulp.src('./app/**/*.js') // 压缩文件：js目录下所有的js文件
    .pipe(plumer()) //异常处理
    .pipe(uglify())  // 使用uglify插件执行压缩操作
    .pipe(gulp.dest('./dist'));  // 输出压缩后的文件
});

gulp.task('changed',function(){
  return gulp.src('./server/**/*.js') // 监视文件：js目录下所有的js文件
    .pipe(changed('./dist'))  // 过滤未修改文件,需要指定文件输出目录
    .pipe(gulp.dest('./dist'));  // 输出文件
});

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});