var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var app = express();
var moment = require('moment');
var multer = require('multer');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'gkxm2525',
    database: 'bookreport'
});


router.get('/', function(req, res) {
    res.redirect('/board/list/1');
});


router.get('/list/:id', function(req, res) {
    var page = req.params.id;
    pool.getConnection(function(err, conn) {
        if (err)
            console.log(err);

        var sql = "SELECT b.id,b.title,b.since,u.displayName FROM board b JOIN users u WHERE b.user_id=u.id";
        conn.query(sql, function(err, results) {
            if (err)
                console.log("getArticle Query Err" + err);
            res.render('board', {
                user: req.user,
                data: results,
                page: page,
                leng: Object.keys(results).length - 1,
                page_num: 10,
                pass: true
            });
            conn.release();
        });
    });
});

router.get('/write', function(req, res) {
    //console.log("Write page");
    res.render('board/write');
});

router.post('/write', function(req, res) {

    var newArticle = {
        title: req.body.title,
        content: req.body.content,
        since: new Date(),
        user_id: req.user.id
    };
    pool.getConnection(function(err, conn) {
        if (err)
            console.log("Write ERR: " + err);
        var sql = "INSERT INTO board SET ?";
        conn.query(sql, newArticle, function(err) {
            if (err)
                console.log("Write Query Err" + err);
            conn.release();
            res.redirect('/board/list/1');
        });

    });

});

// 이 경로로 바로 들어왔을 때 현재 유저와 게시글 쓴 유저의 값을 비교해서 처리해야됨

router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    var id = req.params.id;
    pool.getConnection(function(err, conn) {
        if (err)
            console.log("Content ERR" + err);
        var sql = "select * from board where id=?";

        conn.query(sql, id, function(err, results) {
            if (err)
                console.log("get Content Err" + err);
            conn.release();
            //console.log(results);
            if (req.user.id === results[0].user_id) {
                res.render('board/edit', { user: req.user, article: results[0] });
            } else {
                res.redirect('/board/list/1');
            }

        });
    });
});



router.post('/edit/:id', function(req, res) {
    var id = req.params.id;
    pool.getConnection(function(err, conn) {
        if (err)
            console.log("Edit Err" + err);
        var edit = [
            req.body.title,
            req.body.content,
            req.params.id
        ];

        var sql = "UPDATE board SET title=?,content=? WHERE id=?";
        conn.query(sql, edit, function(err, results) {
            conn.release();
            res.redirect('/board/list/1');
        });
    });
});



router.get('/content/:id', function(req, res) {
    var id = req.params.id;
    pool.getConnection(function(err, conn) {
        if (err)
            console.log("Content ERR" + err);
        var sql = "SELECT * FROM board WHERE id=?";

        conn.query(sql, id, function(err, results) {
            if (err)
                console.log("get Content Err" + err);
            conn.release();
            //console.log(results);
            res.render('board/content', { user: req.user, article: results[0] });
        });
    });


});

// 이 경로로 바로 들어왔을 때 현재 유저와 게시글 쓴 유저의 값을 비교해서 처리해야됨
router.get('/delete/:id', function(req, res) {
    var id = req.params.id;

    pool.getConnection(function(err, conn) {
        if (err)
            console.log("Delete Err" + err);
        var sql = "SELECT user_id FROM board WHERE id=?";
        conn.query(sql, function(err, result) {
            if (req.user.id === result) {
                sql = "DELETE FROM board WHERE id=?";
                conn.query(sql, id, function(err, results) {
                    if (err)
                        console.log("delete Content Err" + err);
                    conn.release();
                    res.redirect('/board/list/1');
                });
            }
            res.redirect('/board/list/1');
        });

    });
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, board 페이지로 진행
    res.redirect('/board');
}

//test
router.get('/get', function(req, res) {
    res.render('board/test');
});


router.get('/get/:id', function(req, res) {
    var page = req.params.id;

    //console.log(user);
    pool.getConnection(function(err, conn) {
        if (err)
            console.log(err);

        var sql = "SELECT b.id,b.title,b.since,u.displayName FROM board b JOIN users u WHERE b.user_id=u.id";
        conn.query(sql, function(err, results) {
            if (err)
                console.log("getArticle Query Err" + err);
            res.json({
                data: results,
                page: page,
                leng: Object.keys(results).length - 1,
                page_num: 10,
                pass: true
            });
            conn.release();
        });
    });
});



module.exports = router;