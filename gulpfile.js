/**
 * @author Joren Thijs
 * @version V1.1
 *
 * @summary This gulp file contains all development and build tools for a standard website.
 * @description This file was made using Gulp V4.0.2.
 * It performs build tasks like compiling and hosting a dev server.
 * It also performs publish tasks like bundeling and minifying.
 *
 * @tutorial type gulp <command> to use the toolset.
 *
 * @exports build Compile the sass into css.
 * @exports watch Starts the dev server and watches for file changes.
 * @exports release Compiles and minifys project and publishes to the dist folder.
 * @exports releaseAll Cleares cache + Compiles and minifys project and publishes to the dist folder.
 * @exports clearCache Cleares cache.
 * @exports clearDist Deletes contents of the dist folder.
 * @exports deploy Deploy bundled output to remote server using rsync.
 */

// Imports
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourceMaps = require('gulp-sourcemaps');
const lineEndingCorrector = require('gulp-line-ending-corrector');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const strip_comments = require('gulp-strip-json-comments');
const prettier = require('gulp-prettier');
const useref = require('gulp-useref');
const gulpIf = require('gulp-if');
const imageMin = require('gulp-imagemin');
const cache = require('gulp-cache');
const rsync = require('gulp-rsync');
const del = require('del');
const browserSync = require('browser-sync').create();

// Server configuration for deployment
var deployConfiguration = require('./deploy.conf.json');

/**
 * Configuration for the gulp-prettier formatter
 */
const prettierOptions = {
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'es5',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
    ],
};

/**
 * Compiles the scss in the '/scss/' folder into regular css into the '/css/' folder
 */
function compileSass() {
    return (
        gulp
            // Locate sass files
            .src('./src/scss/*.scss')
            // Initialize sourceMaps
            .pipe(sourceMaps.init())
            // Compile sass into css
            .pipe(sass().on('error', sass.logError))
            // Add support for older browsers
            .pipe(autoprefixer('last 2 versions'))
            // Format CSS
            .pipe(prettier(prettierOptions))
            // Correct Line endings
            .pipe(lineEndingCorrector())
            // Write sourceMaps
            .pipe(sourceMaps.write('./maps'))
            // Save the compiled css
            .pipe(gulp.dest('./src/css'))
            // Stream changes to all browsers
            .pipe(browserSync.stream())
    );
}

/**
 * Publish HTML, CSS, JS to the dist folder and concat and minify the CSS and JS while replacing its's html references
 */
function bundleHTML() {
    return (
        gulp
            // Locate HTML Files
            .src('./src/*.html')
            // Concat CSS and JS and replace references with bundle references
            .pipe(useref())
            // Minify the bundled Assets
            // Remove comments
            .pipe(strip_comments())
            // Format CSS and JS
            .pipe(prettier(prettierOptions))
            // Minify the CSS
            .pipe(gulpIf('*.css', cleanCSS()))
            // Minify the JS
            .pipe(gulpIf('*.js', uglify()))
            // Correct Line endings
            .pipe(lineEndingCorrector())
            // Save the HTML Files
            .pipe(gulp.dest('./dist'))
    );
}

/**
 * Publish fonts to the './dist' folder
 */
function bundleFonts() {
    return (
        gulp
            // Locate fonts
            .src('./src/fonts/**/*')
            // Save the fonts
            .pipe(gulp.dest('./dist/fonts'))
    );
}

/**
 * Publish and minify images to the './dist' folder
 */
function bundleImages() {
    return (
        gulp
            // Locate Images
            .src('./src/images/**/*.+(png|jpg|jpeg)')
            // Minify images and cache them for better performance
            .pipe(cache(imageMin()))
            // Save the Images
            .pipe(gulp.dest('./dist/images'))
    );
}

/**
 * Publish svg icons to the './dist' folder
 */
function bundleIcons() {
    return (
        gulp
            // Locate Images
            .src('./src/images/**/*.+(svg)')
            // Save the Images
            .pipe(gulp.dest('./dist/images'))
    );
}

/**
 * Publish downloadable content to the './dist' folder
 */
function bundleDownloads() {
    return (
        gulp
            // Locate content
            .src('./src/downloads/**/*')
            // Save the content
            .pipe(gulp.dest('./dist/downloads'))
    );
}

/**
 * Publish downloadable content to the './dist' folder
 */
function bundleManifest() {
    return (
        gulp
            // Locate content
            .src('./src/*.webmanifest')
            .pipe(gulp.dest('./dist'))
    );
}

/**
 * Clear the gulp-cache
 */
function clearCache() {
    return cache.clearAll();
}

/**
 * Delete the contents of the './dist' folder
 */
function clearDist() {
    return del(['./dist/**', '!dist']);
}

/**
 * Deploy bundled output to remote server using rsync.
 */
function deploy() {
    return gulp.src('dist/**/*').pipe(
        rsync({
            root: 'dist/',
            username: deployConfiguration.username,
            hostname: deployConfiguration.hostname,
            destination: deployConfiguration.destination,
            port: deployConfiguration.port,
            compress: deployConfiguration.compress,
            chmod: deployConfiguration.chmod,
            verbose: true,
            progress: true,
            silent: false,
            archive: true,
        })
    );
}

/**
 * Starts the dev server and watches for file changes
 * @listens port 3000
 */
function watch() {
    browserSync.init({
        server: {
            baseDir: './src',
        },
        open: false,
        reloadOnRestart: true,
    });
    compileSass();
    gulp.watch('./src/scss/**/*.scss', compileSass);
    gulp.watch('./src/*.html').on('change', browserSync.reload);
    gulp.watch('./src/js/**/*.js').on('change', browserSync.reload);
    gulp.watch('./src/downloads/**/*').on('change', browserSync.reload);
}

// Exports
exports.build = compileSass;
exports.watch = watch;
exports.release = gulp.series(
    compileSass,
    clearDist,
    gulp.parallel(bundleHTML, bundleImages, bundleIcons, bundleDownloads, bundleManifest, bundleFonts)
);
exports.releaseAll = gulp.series(
    clearCache,
    compileSass,
    clearDist,
    gulp.parallel(bundleHTML, bundleImages, bundleIcons, bundleDownloads, bundleManifest, bundleFonts)
);
exports.clearCache = clearCache;
exports.clearDist = clearDist;
exports.deploy = deploy;
