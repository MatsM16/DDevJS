const { src, dest, series, parallel} = require("gulp");
const compile_sass = require("gulp-sass");
const compile_typescript = require("gulp-typescript");
const minify_css = require("gulp-clean-css");
const minify_js = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const del = require("del");
const mergeStreams = require("merge-stream");
const zip = require("gulp-zip");

const path =
{
    source(project, ...extensions)
    {
        if (extensions.length === 0)
            extensions.push("*");
        return extensions.map(extension => `../source/${project}/**/*.${extension}`);
    },

    build(fileName)
    {
        return `../build/${fileName || ""}`;
    },

    demo(fileName)
    {
        return `../demo/${fileName || ""}`;
    }
}

const getBuild = 
{
    scss(project, outFile)
    {
        const dev = 
            src(path.source(project, "sass", "scss"))
            .pipe(sourcemaps.init())
            .pipe(compile_sass())
            .pipe(src(path.source(project, "css")))
            .pipe(concat(`dev.${outFile}`))
            .pipe(minify_css())
            .pipe(sourcemaps.write(undefined, {sourceRoot:project}))
            .pipe(dest(path.build()))

        const prod = 
            src(path.source(project, "sass", "scss"))
            .pipe(compile_sass())
            .pipe(src(path.source(project, "css")))
            .pipe(concat(outFile))
            .pipe(minify_css())
            .pipe(dest(path.build()))

        return mergeStreams(dev,prod);
    },

    ts(project, outFile)
    {
        const compile_dev = compile_typescript.createProject("./tsconfig.json");
        const compile_prod = compile_typescript.createProject("./tsconfig.json");

        const dev = 
            src(path.source(project, "ts"))
            .pipe(sourcemaps.init())
            .pipe(compile_dev())
            .pipe(src(path.source(project, "js")))
            .pipe(concat(`dev.${outFile}`))
            .pipe(minify_js())
            .pipe(sourcemaps.write(undefined, {sourceRoot:project}))
            .pipe(dest(path.build()))

        const prod = 
            src(path.source(project, "ts"))
            .pipe(compile_prod())
            .pipe(src(path.source(project, "js")))
            .pipe(concat(outFile))
            .pipe(minify_js())
            .pipe(dest(path.build()))

        return mergeStreams(dev,prod);
    }
}

const tasks = 
{
    "clean:pre": function ()
    {
        return del([
            "../build/**",
            "../demo/**.js",
            "../demo/**.css",
            "../demo/**.ts", 
            "../demo/**.map"
        ], {force: true});
    },

    "clean:build:post": function ()
    {
        return del(["../build/**", "!../build/**.zip"], {force: true});
    },

    "clean:demo:pre": function ()
    {
        return del(["../demo/**.js","../demo/**.css","../demo/**.ts", "../demo/**.map"], {force: true});
    },

    "zip:build:post": function ()
    {
        return mergeStreams(
            src("../build/dev.**").pipe(zip("dev.ddevjs.zip")).pipe(dest("../build/")),
            src("../build/ddevjs.**").pipe(zip("ddevjs.zip")).pipe(dest("../build/"))
        )
    },

    "build:demo:post": function ()
    {
        return src("../build/dev.**").pipe(dest("../demo/"));
    },

    "build:DDevJS.Styles": function ()
    {
        return getBuild.scss("DDevJS.Styles", "ddevjs.css");
    },

    "build:DDevJS.Components": function ()
    {
        return getBuild.ts("DDevJS.Components", "ddevjs.components.js");
    }
}

exports.clean = tasks["clean"];

exports.build = series(
    tasks["clean:pre"], 


    parallel(
        tasks["build:DDevJS.Styles"],
        tasks["build:DDevJS.Components"]
    ),
    
    tasks["build:demo:post"],
    tasks["zip:build:post"],
    tasks["clean:build:post"]
);