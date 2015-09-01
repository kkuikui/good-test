/**
 * 初始化
 * npm install gulp-util gulp-imagemin gulp-sass gulp-minify-css gulp-uglify gulp-rename gulp-concat gulp-clean gulp-clean tiny-lr --save-dev
 */

// 引入 gulp及组件
var gulp       = require('gulp'),                  //基础库
    imagemin   = require('gulp-imagemin'),         //图片压缩
    sass       = require('gulp-sass');             //sass编译
    minifycss  = require('gulp-minify-css'),       //css压缩
    jshint     = require('gulp-jshint'),           //js检查
    uglify     = require('gulp-uglify'),           //js压缩
    rename     = require('gulp-rename'),           //重命名
    concat     = require('gulp-concat'),           //合并文件
    clean      = require('gulp-clean'),            //清空文件夹
    webserver  = require('gulp-webserver'),        //启用实时浏览
    opn        = require('opn'),                   //启用实时浏览
    zip        = require('gulp-zip'),              //压缩文件
    copy       = require("gulp-copy"),             //拷贝文件
    tinylr     = require('tiny-lr'),               //livereload
    server     = tinylr(),
    port       = 35729,
    livereload = require('gulp-livereload'),
    config     = require('./config.json');         //livereload

// HTML处理
gulp.task('html', function() {
    var htmlSrc = './src/*.html',
        htmlDst = './dist/';

    gulp.src(htmlSrc)
        .pipe(livereload(server))
        .pipe(gulp.dest(htmlDst))
});

// 样式处理
// gulp.task('css', function () {
//     var cssSrc = './src/scss/*.scss',
//         cssDst = './dist/css';

//     gulp.src(cssSrc)
//         .pipe(sass({ style: 'expanded'}))
//         .pipe(gulp.dest(cssDst))
//         .pipe(rename({ suffix: '.min' }))
//         .pipe(minifycss())
//         .pipe(livereload(server))
//         .pipe(gulp.dest(cssDst));
// });

gulp.task('sass', function(done) {
  gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./dist/css/'))
    .pipe(minifycss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist/css/'))
    .on('end', done);
});
gulp.task('css', function(done) {
  gulp.src('./src/css/*.css')
    .pipe(minifycss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist/css/'))
    .on('end', done);
});

// 图片处理
gulp.task('images', function(){
    gulp.src('./dist/images', {read: false})
        .pipe(clean());
    var imgSrc = ['./src/images/*','./src/images/**/*'],
        imgDst = './dist/images';
    gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(livereload(server))
        .pipe(gulp.dest(imgDst));
});

//合并js文件夹下的所有javascript 文件为一个main.js放入dist/js下   
gulp.task('alljs', function() {
  return gulp.src('./js/*.js')
    .pipe(concat('main.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});

// js处理
gulp.task('js', function () {
    var mainSrc = './src/js/main.js',
        mainDst = './dist/js/',
        appSrc = './src/js/vendor/*.js',
        appDst = './dist/js/vendor/';

    gulp.src(mainSrc)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        // .pipe(concat('main.js'))
        // .pipe(gulp.dest(jsDst))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(concat("main.js"))
        .pipe(gulp.dest(mainDst))
        .pipe(livereload(server));

    gulp.src(appSrc)
        .pipe(uglify())
        //.pipe(concat("vendor.js"))
        .pipe(gulp.dest(appDst))
        .pipe(livereload(server));
});

//重命名project.md 文件
gulp.task('rename', function() {
  return gulp.src("./src/Project.md")
      .pipe(rename("README.md"))
      .pipe(gulp.dest("./dist")); 
});

//开启本地 Web 服务器功能
gulp.task('webserver', function() {
  gulp.src( './dist' )
    .pipe(webserver({
      host:             config.localserver.host,
      port:             config.localserver.port,
      livereload:       true,
      directoryListing: false
    }));
});

//通过浏览器打开本地 Web服务器 路径
gulp.task('openbrowser', function() {
  opn( 'http://' + config.localserver.host + ':' + config.localserver.port );
});

// 清空图片、样式、js
gulp.task('clean', function() {
    gulp.src(['./dist/css', './dist/js/main.js','./dist/js/vendor', './dist/images'], {read: false})
        .pipe(clean());
});


//项目完成提交任务
gulp.task('build', function(){
  gulp.run('clean');
  gulp.run('html');
  gulp.run('sass');
  gulp.run('css');
  gulp.run('images');
  gulp.run('alljs');
  gulp.run('js');
  gulp.run('rename');
});

// 监听任务 运行语句 gulp watch
gulp.task('watch',function(){

    server.listen(port, function(err){
        if (err) {
            return console.log(err);
        }

        // 监听html
        gulp.watch('./src/*.html', function(event){
            gulp.run('html');
        })

        // 监听css
        gulp.watch('./src/scss/*.scss', function(){
            gulp.run('sass');
        });
        gulp.watch('./src/css/*.css', function(){
            gulp.run('css');
        });

        // 监听images
        gulp.watch(['./src/images/*','./src/images/**/*'], function(){
            gulp.run('images');
        });

        // 监听js
        gulp.watch(['./src/js/main.js','./src/js/vendor/*.js'], function(){
            gulp.run('js');
        });

    });
});

//默认任务
gulp.task('default', function(){
  console.log('Starting Gulp tasks, enjoy coding!');
  gulp.run('watch');
  gulp.run('webserver');
  gulp.run('openbrowser');
});

//打包主体build 文件夹并按照时间重命名
gulp.task('zip', function(){
      function checkTime(i) {
          if (i < 10) {
              i = "0" + i
          }
          return i
      }
          
      var d=new Date();
      var year=d.getFullYear();
      var month=checkTime(d.getMonth() + 1);
      var day=checkTime(d.getDate());
      var hour=checkTime(d.getHours());
      var minute=checkTime(d.getMinutes());

  return gulp.src('./dist/**')
        .pipe(zip( config.project+'-'+year+month+day +hour+minute+'.zip'))
        .pipe(gulp.dest('./'));
});
