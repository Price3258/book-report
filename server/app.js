var express = require('express');
var app = express();
var mysql = require('mysql');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gkxm2525',
    database: 'bookReport'
});
conn.connect();
app.use(session({
    secret: 'Node.JS',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'gkxm2525',
        database: 'bookReport'
    })
}));

//app.use(morgan('combined'));


app.use('/public', express.static(__dirname + '/../fe/public'));
app.use('/uploads', express.static(__dirname + '/public/uploads'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//views set up
app.set('views', '../fe');
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


//passport.JS
app.use(passport.initialize());
app.use(passport.session());


///Routes
var routes = require('./routes');
var auth = require('./routes/auth');
var board = require('./routes/board');
//var socket_io=require('./routes/socket');

app.use('/', routes);
app.use('/auth', auth);
app.use('/board', board);
//app.use('/socket',socket_io);

//handle code error page
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('서버 오류');
});
//handle not found page
app.use(function(req, res, next) {
    res.status(404).send('없는 페이지입니다.');
});

app.listen(3000, function() {
    console.log('running at http://localhost:3000');
});