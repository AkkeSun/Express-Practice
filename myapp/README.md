[LOCAL 경로 설정] 
// 경로를 정규식으로 만든다 : 현재경로/public
path.join(__dirname, 'public') 

// static 경로 설정 : view단에서 로컬파일(js, css, 이미지 등)을 읽을 때 설정
app.use(express.static(path.join(__dirname, 'public')));

// jquery 경로 설정 : /jquery 로 들어오면 다음 위치를 읽음
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));

<script src="/jquery/jquery.js"></script>
<script src="/javascripts/plugins.js"></script>

------------------------------------------------------

[라우팅 & 미들웨어] -> 언제 실행할래?

// 타입 상관없이 무조건 읽어라
app.use(function(req, res, next) {...});
// myPath로 들어오면 타입 상관없이 읽어라
app.use('/myPath', function(req, res, next) {...});
// myPath가 get으로 들어오면 읽어라
app.get('/myPath', function(req, res, next) {...});

// myPath로 들어오면 순차적으로 읽어라 
(next() 없으면 종료)
(res 한 다음에 next() 불가능)

app.get(/myPath1, function(req, res, next) {
   req.name = 'sun'; // 변수 지정
   next();
})
app.get(/myPath1, function(req, res, next) {
   console.log(req.name); // 변수 불러다 쓰기
   ...
})


------------------------------------------------------



[모듈의 사용 -> 함수를 객채화 해서 사용하는 개념]
// myModule.js 만들기
let login = (req, res, next) => {

    let login = false;
    let mem = req.session.login;
    
    if(mem != undefined)
      login = true;
  
    req.login = login;
    next(); 
}
let alert = () => { console.log("Hello Module!"); }

module.exports.loginCheck = login;          // module.exports = {loginCheck : function(){}; } 와 같음
module.exports.alertConsole = alert; 


// 사용하기
var myModule = require('./my_modules/myModule');

myModule.alertConsole();
// 미들웨어를 등록하는 경우 파라미터 입력을 위해 app.use로 감싸준다
app.use(function(req, res, next){
  myModule.loginCheck(req,res,next);
});

혹은 
var myAlert = require('./my_modules/myModule').alertConsole;
myAlert();
이렇게 바로 변수에 저장해서 사용하기도 가능하다.
------------------------------------------------------


[라우터와 ejs] 
 => node.js는 기본적으로 비동기 처리이므로, 동기식을 구현하려면 next()를 활용하자

// index.js
var express = require('express');
var router = express.Router();

// path = /test/a 
router.get('/a', function(req, res, next) {
    // 기본 위치 view 다음부터 작성. 앞에 '/' 생략
    res.render('index', { title: 'Express'}); 
});
module.exports = router; 

// app.js
var express = require('express');
var indexRouter = require('./routes/index');
app.use('/test', indexRouter); 

// index.ejs
<!DOCTYPE html>
<html>
  <% include common/head %>   // 다른 ejs파일 로드
  <body>
    <% include common/header %>

    <h1><%= title %></h1>     // js에서 넘어온 데이터
    <p>Welcome to <%= title %></p>
   
    <% include common/footer %>
  </body>
</html>



------------------------------------------------------



[요청과 응답]
req.body : POST 정보 (body-parser 필요)
let {id, pwd} = req.body // 두 변수에 값 저장
req.query : GET 정보(쿼리스트링) 
req.params : 라우트 파라미터 정보 ( /test/:id ) 
req.cookie('key', val) : 쿠키생성

//text, json등 값에 따라 변경되어 전송
res.send('text') 
res.send({'id':id})
res.redirect() : 리다이렉트 
res.render() : views 렌더링
res.json(result) : JSON 전송 (ajax)


-------------------------------------


자바스크립트에서 POST로 송출하기 
let url = '/users/regiAf';
var form = document.createElement('form');
form.setAttribute('method', 'post');
form.setAttribute('action', url);

var hiddenField = document.createElement('input');
hiddenField.setAttribute('type', 'hidden');
hiddenField.setAttribute('name', 'val1');
hiddenField.setAttribute('value', 'val1');
form.appendChild(hiddenField);

document.body.appendChild(form);
form.submit();

-----------------파일---------------


-----------------rest---------------
// GET: /blogs
app.get("/blogs", async (req, res) => {
  try {
    const { filter, skip, limit } = req.query;
    const blogs = await Blog.find(filter).skip(skip).limit(limit);
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

// POST: /blogs
app.post("/blogs", async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

// PUT: /blogs/:id
app.put("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOneAndUpdate({ _id: id }, req.body);
    if (blog == null) {
      res.status(404).json({ success: false });
      return;
    }
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

// DELETE /blogs/:id
app.delete("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOneAndDelete({ _id: id });
    if (blog == null) {
      res.status(404).json({ success: false });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});
