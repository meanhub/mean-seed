'use strict';

var gulp = require('gulp'),
    argv = require('yargs').argv,
    gulpif = require('gulp-if'),
    rimraf = require('rimraf'),
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    growl = require('gulp-notify-growl'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    processhtml = require('gulp-processhtml'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    nodemon = require('gulp-nodemon');


var isProd = argv.prod;

// to ignore files/folder use this syntax '!static/js/**/*.js',
var libFiles = [
    'client/bower_components/angular/angular.min.js',
    'client/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'client/bower_components/bootstrap/dist/css/bootstrap.min.css'
];

var jsFiles = [
    'client/google-analytics-meanhub.js',
    'client/app/index/**/*module.js',
    'client/app/index/**/*config.js',
    'client/app/index/**/*svc.js',
    'client/app/index/**/*ctrl.js',
];

var scssFiles = [
    'client/static/style/**/*.scss'
]

var deployFolder = '../deploy';
var growlNotifier = growl();

// rimraf is a rm -rf command to delete a folder recursively
gulp.task('clean', function (cb) {
    rimraf(deployFolder, cb);
});


gulp.task('jscs', function() {
    gulp.src(jsFiles)
        .pipe(jscs('.jscsrc'))
        .pipe(jshint.reporter('fail'))
        .pipe(notify({
            title: 'JSCS',
            message: 'JSCS Passed!',
            notifier: growlNotifier
        }))
});


gulp.task('jshint', function() {
    gulp.src(jsFiles)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(notify({
            title: 'JSHint',
            message: 'JSHint Passed!',
            notifier: growlNotifier
        }))
});


gulp.task('process-js', function () {
    gulp.src(libFiles, {base: './client/'})
        .pipe(gulp.dest(deployFolder));

    gulp.src(jsFiles, {base: './'})
        //.pipe(debug())
        .pipe(gulpif(isProd, concat('all.min.js'), concat('all.js')))
        .pipe(gulpif(isProd, uglify({mangle: true, preserveComments: 'some'})))
        .pipe(gulp.dest(deployFolder + '/static/js'));
});


gulp.task('process-scss', function () {
    gulp.src(scssFiles)
        .pipe(sass({style: 'expanded'}))
        .pipe(autoprefixer('last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
        .pipe(gulpif(isProd, concat('all.min.css'), concat('all.css')))
        .pipe(gulpif(isProd, minifyCss()))
        .pipe(gulp.dest(deployFolder + '/static/css'));
});


gulp.task('process-html', function () {
    gulp.src('./client/index.html')
        .pipe(gulpif(isProd, processhtml({})))
        .pipe(gulp.dest(deployFolder));
});


gulp.task('deploy-favicons', function () {
    gulp.src([
            './client/static/favicons/**/*.*'])
        .pipe(gulp.dest(deployFolder));
});


gulp.task('deploy-images', function () {
    gulp.src('./client/static/images/**/*', {base: './client/'})
        .pipe(gulp.dest(deployFolder));
});


gulp.task('browser-reload', function () {
    browserSync.reload();
});


gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
        script: 'main.js',
        ignore: [
            'gulpfile.js',
            'node_modules/',
            'client/',
            'deploy/'
        ]
    })
        .on('start', function () {
            if (!called) {
                called = true;
                cb();
            }
        })
        .on('restart', function () {
            setTimeout(function () {
                reload({ stream: false });
            }, 5000);
        });
});


gulp.task('run', function () {
    browserSync({
        proxy: {
            target: 'localhost:3000',
            port: 5000,
            notify: true
        },

        browser: ['google chrome'],
        files: deployFolder + '/**/*',
        watchOptions: {
            debounceDelay: 2000
        }
    });
    gulp.watch(jsFiles, ['process-js']);
    gulp.watch(scssFiles, ['process-scss']);
    gulp.watch('./client/index.html', ['process-html']);
    gulp.watch('./client/app/**/*.html', ['deploy-html']);
    gulp.watch('./client/app/**/*.js', ['process-js']);
});


gulp.task('watch', function () {
    gulp.watch(jsFiles, ['process-js']);
    gulp.watch('./static/styles/*.scss', ['process-scss']);
    gulp.watch('./index.html', ['process-html']);
    gulp.watch('./static/images/*', ['deploy-images']);
});


gulp.task('default', function () {
    runSequence(
        'clean',
        'process-js',
        'process-scss',
        'process-html',
        'deploy-favicons',
        'deploy-images',
        'run',
        'watch'
    );
});
