var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require('moment');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'gkxm2525',
    database: 'bookreport',
    connectionLimit: 20,
    waitForConnections: false
});

router.get('/', function(req, res) {
    var users = false;
    if (req.user)
        users = req.user;

    var sql = "SELECT r.id,r.title,r.book,r.img,u.displayName FROM report r JOIN users u WHERE r.user_id=u.id";

    pool.getConnection(function(err, conn) {
        if (err) {
            console.log("pool get connection error: " + err);
            conn.release();
        }
        //sql = "SELECT * FROM report";
        conn.query(sql, function(err, result) {
            if (err) {
                console.log("index query err" + err);
                conn.release();
            }
            // console.log(result);
            res.render('index', { user: users, report: result });
            conn.release();
        });
    });
});


router.post('/search/book', function(req, res) {
    var client_id = 'your client id';
    var client_secret = 'client secret';
    var book = req.body.book;
    var display = 40;
    console.log("req.params.book", book);
    var api_url = 'https://openapi.naver.com/v1/search/book?query=' + encodeURI(book) + '&display=' + display; // json 결과
    //   var api_url = 'https://openapi.naver.com/v1/search/blog.xml?query=' + encodeURI(req.query.query); // xml 결과
    var request = require('request');
    var options = {
        url: api_url,
        headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }

    };
    request.get(options, function(error, response, result) {

        if (!error && response.statusCode == 200) {
            //res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            //res.end(result);
            //res.render('book/list',{result:result});
            res.send(result);
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

router.get('/view/:id', function(req, res) {
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log('view get Connection err : ' + err);
            conn.release();
        }

        var sql = "SELECT * FROM report WHERE id=?";
        conn.query(sql, req.params.id, function(err, results) {
            if (err) {
                console.log('view query err : ' + err);
                conn.release();
            }
            res.render('book/view', { report: results[0] });
            conn.release();
        });
    });

});

router.get('/search', function(req, res) {
    res.render('book/search');
});
router.post('/write', ensureAuthenticated, function(req, res) {
    var newReport = {
        title: req.body.title,
        content: req.body.content,
        star: req.body.star,
        book: req.body.book,
        img: req.body.img,
        since: new Date(),
        user_id: req.user.id,
    };
    console.log(newReport.title);

    //console.log("new Report" + newReport);
    pool.getConnection(function(err, conn) {
        if (err) {
            console.log("Write report err" + err);
            conn.release();
        }

        var sql = "INSERT INTO report SET ?";
        conn.query(sql, newReport, function(err, result) {
            if (err) {
                console.log("Write report Query err" + err);
                conn.release();
            }
            res.send(result);
            conn.release();
        });
    });


});

router.get('/write', ensureAuthenticated, function(req, res) {
    res.render('book/write');
});
router.get('/mine', ensureAuthenticated, function(req, res) {
    var users = false;
    if (req.user)
        users = req.user;

    var sql = "SELECT r.id,r.title,r.book,r.img,u.displayName FROM report r JOIN users u WHERE r.user_id=u.id and r.user_id=?";

    pool.getConnection(function(err, conn) {
        if (err) {
            console.log("pool get connection error: " + err);
            conn.release();
        }
        //sql = "SELECT * FROM report";
        conn.query(sql, req.user.id, function(err, result) {
            if (err) {
                console.log("index query err" + err);
                conn.release();
            }
            // console.log(result);
            res.render('book/mine', { user: users, report: result });
            conn.release();
        });
    });
});

router.get('/edit/:id',ensureAuthenticated,function(req,res){
    pool.getConnection(function(err,conn){
        if(err){
            console.log("edit get connection err: "+err);
            conn.release();
        }
        var sql="SELECT * FROM report WHERE id=?";
        conn.query(sql,req.params.id,function(err,result){
            if(err){
                console.log("edit get query err : "+ err);
                conn.release();
            }
            res.render('book/edit',{report:result[0]});
            conn.release();
        });
    });
});

router.post('/edit/:id',ensureAuthenticated,function(req,res){
    var params=[req.body.title,req.body.content,req.body.star,new Date(),req.params.id];
    pool.getConnection(function(err,conn){
        if(err){
            console.log("edit post connection err : " + err);
            conn.release();
        }
        var sql="UPDATE report SET title=?,content=?,star=?,since=? WHERE id=?";        
        conn.query(sql,params,function(err,result){
            if(err){
                console.log("edit post query err : "+ err);
                conn.release();
            }
            res.redirect('/');
        });
    });
    
});

router.get('/delete/:id',ensureAuthenticated, function(req, res) {
    
    pool.getConnection(function(err,conn){
        if(err){
            console.log("delete connection err : "+ err);
            conn.release();
        }
        var sql="DELETE FROM report WHERE id=?";
        conn.query(sql,req.params.id,function(err,result){
            if(err){
                console.log("delete query err : "+err);
                conn.release();
            }
            res.redirect('/mine');
            conn.release();
        });
    })
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/');
}


module.exports = router;