// All used modules.
var gulp = require('gulp');
var babel = require('gulp-babel');
var runSeq = require('run-sequence');
var plumber = require('gulp-plumber');
var eslint = require('gulp-eslint');
var notify = require('gulp-notify');
var path = require("path");

/*
 ██████  ██████  ████████ ██  ██████  ███    ██ ███████
██    ██ ██   ██    ██    ██ ██    ██ ████   ██ ██
██    ██ ██████     ██    ██ ██    ██ ██ ██  ██ ███████
██    ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
 ██████  ██         ██    ██  ██████  ██   ████ ███████
*/

var esLintRules = {
    "eqeqeq": 0,
    "no-use-before-define": 0
};

// Browser

var browserJsSrc = ['./src/js/main.js', './src/js/**/*.js'];

var browserCssSrc = ['./src/scss/**', './src/scss/**/*.scss'];

var esLintBrowser = {
    "rules": esLintRules,
    "env": {
        "jquery": true
    },
    // "globals": {
        // "CORE": true,
        // "d3": true,
        // "d3v4": true
    // }
};

// -----------------------------------------------------------------------------
// automator
// -----------------------------------------------------------------------------

var automatorOpts = {
    gulp: gulp
};

// -----------------------------------------------------------------------------
// automator execution
// -----------------------------------------------------------------------------

var automator = require("@ttcorestudio/automator")(automatorOpts);

var coreWebLibDir = automator.coreWebLibDir;

/*
██████  ███████ ██    ██ ████████  █████  ███████ ██   ██ ███████
██   ██ ██      ██    ██    ██    ██   ██ ██      ██  ██  ██
██   ██ █████   ██    ██    ██    ███████ ███████ █████   ███████
██   ██ ██       ██  ██     ██    ██   ██      ██ ██  ██       ██
██████  ███████   ████      ██    ██   ██ ███████ ██   ██ ███████
*/

// -----------------------------------------------------------------------------
// Linting
// -----------------------------------------------------------------------------

gulp.task('lintBrowserJS', function () {
    return gulp.src(browserJsSrc)
        .pipe(plumber({
            errorHandler: notify.onError('Linting FAILED! Check your gulp process.')
        }))
        .pipe(eslint(esLintBrowser))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

// -----------------------------------------------------------------------------
// building
// -----------------------------------------------------------------------------

gulp.task('buildJS', function () {
    return gulp.src(browserJsSrc)
        .pipe(automator.pipes.jsBuildDev("main.js"))
        .pipe(gulp.dest('./public'));
});

gulp.task('buildCSS', function () {
    return gulp.src('./src/scss/main.scss')
        .pipe(automator.pipes.cssBuildDev("style.css"))
        .pipe(gulp.dest('./public'));
});

/*
██████  ██████   ██████  ██████  ██    ██  ██████ ████████ ██  ██████  ███    ██
██   ██ ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ████   ██
██████  ██████  ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██ ██  ██
██      ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
██      ██   ██  ██████  ██████   ██████   ██████    ██    ██  ██████  ██   ████
*/

gulp.task('buildCSSProduction', function () {
    return gulp.src('./src/scss/main.scss')
        .pipe(automator.pipes.cssBuildProduction("style.css"))
        .pipe(gulp.dest('./public'))
});

gulp.task('buildJSProduction', function () {
    return gulp.src(browserJsSrc)
        .pipe(automator.pipes.jsBuildProduction("main.js"))
        .pipe(gulp.dest('./public'));
});

gulp.task('buildProduction', ['buildCSSProduction', 'buildJSProduction']);

/*
 ██████  ██████  ███    ███ ██████   ██████  ███████
██      ██    ██ ████  ████ ██   ██ ██    ██ ██
██      ██    ██ ██ ████ ██ ██████  ██    ██ ███████
██      ██    ██ ██  ██  ██ ██   ██ ██    ██      ██
 ██████  ██████  ██      ██ ██████   ██████  ███████
*/

gulp.task('build-lite',function(){
    runSeq(['buildJS']);
});

gulp.task('build', function () {
    runSeq(['buildJS', 'buildCSS']);
});

gulp.task('default', function () {

    gulp.start('build');

    gulp.start('lintBrowserJS');

    // Run when anything inside of browser/js changes.
    gulp.watch(browserJsSrc, function () {
        runSeq('lintBrowserJS', 'buildJS');
    });

    // Run when anything inside of browser/scss changes.
    gulp.watch(browserCssSrc, function () {
        runSeq('buildCSS');
    });

});
