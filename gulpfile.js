import gulp from "gulp";
import babel from "gulp-babel";
import GulpCleanCss from "gulp-clean-css";
import { deleteAsync } from "del";
import svgSprite from "gulp-svg-sprite";
import GulpImage from "gulp-image";
import htmlmin from "gulp-htmlmin";
import browserSync from "browser-sync";
import gulpSourcemaps from "gulp-sourcemaps";
import concat from "gulp-concat";
import uglify from "gulp-uglify-es";
import notify from "gulp-notify";
import postcss from "gulp-postcss";
import webpack from "webpack-stream";
import autoprefixer from "autoprefixer";
import cssnanoPlugin from "cssnano";
import config from "./webpack.config.js";
import fileinclude from "gulp-file-include";


const paths = {
  html: {
    src: "src/*.html",
    dest: "app",

  },
  styles: {
    src: "src/assets/css/style.css",
    dest: "app/css/",
  },
  scripts: {
    src: "src/assets/js/**.js",
    dest: "app/js/",
  },
  imgs: {
    src: [
      "src/assets/img/**.jpg",
      "src/assets/img/**.png",
      "src/assets/img/**.jpeg",
      "src/assets/img/*.svg",
      "src/assets/img/**/*.jpg",
      "src/assets/img/**/*.png",
      "src/assets/img/**/*.jpeg",
    ],
    dest: "app/img/",
  },
  svg: {
    src: "src/assets/icons/**.svg",
    dest: "app/assets/icons/",
  },
  fonts: {
    src: "src/assets/fonts/**",
    dest: "app/fonts",
  },
};
async function includeHTML() {
  return  gulp.src(
    paths.html.src
  )

    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.html.dest));
}

function clean() {
  return deleteAsync(["app/"]);
}

function stylesCss() {
  return gulp
    .src(paths.styles.src)
    .pipe(gulpSourcemaps.init())
    .pipe(GulpCleanCss({ level: 2 }))
    .pipe(postcss([autoprefixer(), cssnanoPlugin()]))
    .pipe(gulpSourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(gulpSourcemaps.init())
    .pipe(concat("scripts.js"))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(webpack(config))
    .pipe(uglify.default().on("error", notify.onError()))
    .pipe(gulpSourcemaps.write("."))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src(paths.imgs.src)
    .pipe(GulpImage())
    .pipe(gulp.dest(paths.imgs.dest));
}

function svgSprites() {
  return gulp
    .src(paths.svg.src)
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(gulp.dest(paths.svg.dest));
}

function fonts() {
  return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}

function htmlMinify() {
  return gulp
    .src(paths.html.src)
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

function watch() {

  browserSync.init({
    server: {
      baseDir: "app",
    },
  });
  gulp.watch("src/assets/html/*.html", includeHTML);
  gulp.watch(paths.html.src, htmlMinify);
  gulp.watch(paths.styles.src, stylesCss);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.imgs.src, images);
  gulp.watch(paths.fonts.src, fonts);
  gulp.watch(paths.svg.src, svgSprites);
}

const build = gulp.series(
  clean, includeHTML,
  gulp.parallel(htmlMinify, stylesCss, scripts),
  images,
  svgSprites,
  fonts,
  watch
);

export { clean };
export { stylesCss as css };
export { scripts };
export { watch };
export { images };
export { svgSprites as svg };
export { fonts };
export { htmlMinify };

export default build;
