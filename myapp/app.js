/*------------모듈 로드 ------------------*/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users'); 
var fileRouter = require('./routes/file');
var compression = require('compression');
var session = require('express-session');
var loginCheck = require('./my_modules/loginCheck').loginCheck;

/*------------app 객채 생성 ----------------*/
var app = express();

/*------------view engine setup ------------*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*------------미들웨어 로드 ----------------*/
app.use(logger('dev'));
// body-parser 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 쿠키 설정
app.use(cookieParser());
// static 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// jquery 경로 설정
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));
app.use(compression());
app.use(session({
    secret:"sun-session", // 암호화
    resave:false,
    saveUninitialized:true  
}));
/*------------로그인 체크 -----------------*/
app.use(function(req, res, next){
  loginCheck(req,res,next);
});

/*------------라우팅 설정 -----------------*/
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/file', fileRouter);

/*-------------- 에러 핸들러 ---------------*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
