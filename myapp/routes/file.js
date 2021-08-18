const express = require('express');
const router = express.Router();

const multer = require('multer');
const uuid4 = require("uuid").v4;
const fs = require('fs');
const mime = require('mime'); // 타입 조사
const getDownloadFilename = require('../my_modules/getDownloadFilename').getDownloadFilename;
const DB = require('../my_modules/db').db;


//-------------- multer 커스텀 셋업 --------------
// 저장경로와 파일명 설정
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/')
    },
    filename: (req, file, cb) => {   
        let dataType = mime.getType(file.originalname).split('/'); 
        cb(null, uuid4().replace(/-/g, "") + "." +dataType[1]);
    }
});

// 파일 타입 체크
let filter = (req, file, cb) => { 
    let dataTypeCheck = /png|jpeg|jpg/;
    let dataType = mime.getType(file.originalname).split('/');
    const extName = dataTypeCheck.test(dataType[1]);
    if (extName) {
        req.msg = "upload_success";
        cb(null, true); // true : 업로드 진행
    }
    else {
        req.msg = "upload_fail";
        cb(null, false);
    } 
}

// 최종 셋업
let upload = multer({
    storage: storage,
    fileFilter: filter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

//-------------------- VIEW ROUTER ---------------------------

router.get('/', function(req, res, next) {
    res.render('file/uploadView', {title:'file', login:req.login});
});
router.get('/list', function(req, res, next) {
    res.render('file/list', {title:'file', login:req.login});
});

//-------------------- FILE UPLOAD ---------------------------

// 파일 한개 (파라미터 : 파일 input name 값)
router.post('/upload/oneFile', upload.single('singleFile'), (req, res) => {
    console.log(req.file);
    
    let writerSeq = req.session.login.seq;
    let fileJson = {filename : req.file.filename, originalname:req.file.originalname};
    fileJson = JSON.stringify(fileJson);
    
    let query = 'INSERT INTO FILE(fileJson, writerSeq) VALUES (?, ?)'
    DB.query(query, [fileJson, writerSeq], (err,result) => {
        if(err)
            console.log(err);
        res.render('alert', {code:req.msg});
    });
});
  

// 다중 파일 업로드 : 같은 name값 
router.post('/upload/multiFileSameName', upload.array('multiFile', 10), (req,res) => {
    let array = req.files;
    array.forEach(singleFile => {
        console.log(singleFile);
    });
    res.render('alert', {code:req.msg});
}); 
  

//다중파일 업로드 : 다른 name값
const CpUpload = upload.fields([{name: 'f1', maxCount: 5},{name: 'f2', maxCount: 10}])
router.post('/upload/multiFileDifferentName', CpUpload, (req,res) => {
 
    //K:V 형식으로 담겨있음
    let f1 = req.files.f1;
    let f2 = req.files.f2; 

    f1.forEach(singleFile => {
        console.log(singleFile);
    });
    f2.forEach(singleFile => {
        console.log(singleFile);
    });

    res.render('alert', {code:req.msg});
})

//--------------------- 파일 리스트 가져오기 -----------------
router.get('/getList', function(req, res, next) {
    let query = 'SELECT	f.filejson, f.writerseq, m.id '
              + 'FROM FILE f LEFT JOIN MEMBER m '
              + 'ON f.writerSeq = m.seq';
    DB.query(query, [], (err,result) => {
        if(err)
            console.log(err);
        res.json(result);
    });
});


//--------------------- 파일 다운로드 -----------------------
router.get('/download/:file_name', function(req, res, next) {
    // 데이터 셋팅
    console.log(req.params.file_name);
    var upload_folder = './public/uploads/';
    var file = upload_folder + req.params.file_name; 
    var originalname = "";
    let query = "SELECT JSON_EXTRACT(filejson, '$.originalname') AS oFile "
              + "FROM file "
              + "WHERE JSON_EXTRACT(filejson, '$.filename') = ? ";
    DB.query(query, [req.params.file_name], (err,result) => {
        if(err)
            console.log(err);
        else {
            originalname=result[0].oFile;
            next();
        }
    });
   
    router.get('/download/:file_name', function(req, res, next) {
        console.log(file);
        try {
          // 파일이 존재하는지 체크
          if (fs.existsSync(file)) { 

            // 파일 확장자
            var mimetype = mime.getType(file);  
            // 다운받아질 파일명 설정
            res.setHeader('Content-disposition', 'attachment; filename=' + getDownloadFilename(req, originalname)); 
            // 파일 형식 지정
            res.setHeader('Content-type', mimetype); 
            // 다운로드
            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
            
        } else {
            res.send('해당 파일이 없습니다.');  
            return;
          }
        } catch (e) { 
          console.log(e);
          res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
          return;
        }
    });
});

//--------------------- 파일 삭제 -----------------------
router.get('/delete/:file_name', function(req, res, next) {
    var upload_folder = './uploads';
    var file = upload_folder + req.params.file_name; 
    fs.unlink(file, (req) => {

    })
});

module.exports = router;
