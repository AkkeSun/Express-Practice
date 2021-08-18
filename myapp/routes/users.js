var express = require('express');
var router = express.Router();
var DB = require('../my_modules/db').db;


//---- 로그인 View ----
router.get('/', function(req, res, next) {
  if(res.login)
    res.redirect('/');  
  else 
    res.render('member/login', {title:'login', login:req.login});  
});

//---- 로그인 Af ----
router.post('/loginAf', function(req, res, next) {

  let {id, pwd} = req.body;
  let query = 'SELECT * FROM member where id=? AND pwd=?'
  DB.query(query, [id, pwd], (err,result) => {
    if(err) console.log(err);

    if(result[0] != undefined){
      req.session.login = {'id':result[0].id, 'seq':result[0].seq};
      res.redirect('/');
    }
    else {
      res.render('alert', {code:"login"}); 
    }
  });
});

//---- 회원가입 View ----
router.get('/regi', function(req, res, next){
  res.render('member/regi', {title:'회원가입', login:req.login});
});

//---- 회원가입 Af ----
router.post('/regiAf', function(req, res, next){

  let regiData = req.body;
  var regExpPw = /(?=.*\d{1,50})(?=.*[~`!@#$%\^&*()-+=]{1,50})(?=.*[a-zA-Z]{2,50}).{8,50}$/;
  let msg = "";
  let code = "";
 
  // 아이디 중복 체크 : 동기처리를 위한 next()
  let query = 'SELECT COUNT(*) AS count FROM MEMBER WHERE ID=?';
  DB.query(query, [req.body.id], (err,result) => {  

    if(result[0].count > 0){
      msg = "동일한 아이디가 존재합니다";
      code = "3";
      res.json({"msg":msg, "code":code});
    }
    else 
      next();
  });

  // 유효성 검사
  router.post('/regiAf', function(req, res, next){
    if(regiData.pwd1 != regiData.pwd2){
      msg = "비밀번호 확인이 올바르지 않습니다";
      code = "1";
      res.json({"msg":msg, "code":code});
    }
    else if(!regExpPw.test(regiData.pwd1)){
      msg = "비밀번호는 숫자와 영문자 특수문자 조합으로 10~15자리를 사용해야 합니다";
      code = "2";
      res.json({"msg":msg, "code":code});
    }
    else {
      msg = "성공적으로 가입되었습니다";
      next();
    }
  });

  // 최종 가입
  router.post('/regiAf', function(req, res, next){
    DB.query('INSERT INTO member(id, pwd) VALUES (?, ?)', [req.body.id, req.body.pwd1], (err,result) => {
      if(err) console.log(err);
      req.session.login = {'id':req.body.id, 'seq':req.body.pwd1};
      res.json({"msg":msg});
    });
  });

});



//---- 로그아웃 View ----
router.get('/logout', function(req, res, next){
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
