const {src, dest, series, parallel, watch} = require('gulp');

const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const browserSync  = require('browser-sync').create();
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss     = require('gulp-clean-css');
const imagemin     = require('gulp-imagemin');
const svgmin       = require('gulp-svgmin');
const cheerio      = require('gulp-cheerio');
const svgSprite    = require('gulp-svg-sprite');
const replace      = require('gulp-replace');
const run          = require("run-sequence");
const newer        = require('gulp-newer');
const del          = require('del');

function browsersync() {
    browserSync.init({
        server: { baseDir: 'app/' }, 
        browser: 'chrome'
    })
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'app/javascript/script.js'
    ])
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(dest('app/javascript/'))
    .pipe(browserSync.stream())
}

function styles() {
    return src([
        'app/scss/style.scss',
    ])
        .pipe(sass())
        .pipe(dest('app/css/'))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
        }))
        .pipe(cleancss({
            level: { 1: { specislComments: 0 } },
            format: 'beutify'
        }))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream())
}

function images() {
    return src('app/images/src/**/*.{png,jpg}')
    .pipe(newer('app/images/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/images/dest/'))
}

function cleanimg() {
    return del('app/images/dest/**/*', { force: true })
}

 function svg() {
    return src('app/images/src/**/*.svg')
    .pipe(svgmin({
        js2svg: {
            pretty: true
        }
    }))
    .pipe(cheerio({
        run: function ($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true }
    }))
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
        mode: {
            symbol: {
                sprite: "sprite.svg"
            }
        }
    }))
    .pipe(dest('app/images/dest'));
};


function buildcopy() {
    return src([
        'app/css/**/*.min.css',
        'app/javascript/**/*.min.js',
        'app/images/dest/**/*',
        'app/fonts/**/*',
        'app/**/*.html'
    ], { base:'app'}) 
        .pipe(dest('build', { force: true }))
}

function cleanbuild() {
    return del('build')
}

function startwatch() {
    watch('app/scss/**/*.scss', styles)
    watch([
        'app/**/*.js',
        '!app/**/*.min.js'
    ], scripts) 
    watch('app/**/*.html').on('change', browserSync.reload) 
    watch('app/images/src/**/*', images)
    watch('app/images/src/**/*.svg', svg);
}

exports.scripts     = scripts;
exports.browsersync = browsersync;
exports.styles      = styles;
exports.images      = images;
exports.svg         = svg;
exports.cleanimg    = cleanimg;
exports.buildcopy   = buildcopy;

exports.build = series(cleanbuild, styles, scripts, images, svg, buildcopy)
exports.default = parallel(scripts, styles, browsersync, startwatch)