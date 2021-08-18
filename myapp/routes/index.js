var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  // 최초 로드
  if(req.login == undefined)
    res.render('index', { title: 'Express', login:false});
  else
    res.render('index', { title: 'Express', login:req.login});
});


module.exports = router;
