var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var moment = require('moment');


var hasher = bkfd2Password();
var mysql = require('mysql');
var router = express.Router();
var app = express();



var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'gkxm2525',
    database: 'bookreport'
});


conn.connect();
app.use(session({
    secret: 'Node.JS',
    resave: false,
    saveUninitialized: true,
    // store: new MySQLStore({
    //     host: 'localhost',
    //     port: 3306,
    //     user: 'root',
    //     password: 'gkxm2525',
    //     database: 'bookreport'
    // })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    //console.log('deserializeUser', user.authId);
    //done(null, user);
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [user.authId], function(err, results) {
        if (err) {
            console.log(err);
            done('There is no user.');
        } else {
            done(null, results[0]);
        }
    });
});


passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;
        // console.log(username +"         "+password);
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, ['local:'+uname], function(err, results) {
            if (err) {
                return done('There is no user.');
            }
            /*
            var user = {
                id: results[0].id,
                authId: results[0].authId,
                displayName: results[0].displayName,
                email: results[0].email,
                since: results[0].since
            };
            */
            var user=results[0];
            return hasher({ password: pwd, salt: user.salt }, function(err, pass, salt, hash) {
                if (hash === user.password) {

                    done(null, user);
                } else {
                    done(null, false);
                }
            });
        });
    }
));
passport.use(new FacebookStrategy({
        clientID: 'Facebook clientID',
        clientSecret: 'clientSecret',
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
    },
    function(accessToken, refreshToken, profile, done) {
        //console.log(profile);
        var authId = 'facebook:' + profile.id;
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, [authId], function(err, results) {
            if (results.length > 0) {
                done(null, results[0]);
            } else {
                var newuser = {
                    authId: authId,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    since: new Date()
                };
                var sql = 'INSERT INTO users SET ?'
                conn.query(sql, newuser, function(err, results) {
                    if (err) {
                        console.log(err);
                        done('Error');
                    } else {
                        done(null, newuser);
                    }
                })
            }
        });
    }
));



router.get('/login', function(req, res) {
    res.render('auth/login');
});
router.post('/login', passport.authenticate('local', { failureRedirect: '/auth/login', failureFlash: true }),
    function(req, res) {
        //res.redirect('/login_success');
        res.redirect('/');
    });

router.get('/register', ensureAuthenticated, function(req, res) {
    res.render('auth/register');
});

router.post('/register', function(req, res) {
    hasher({ password: req.body.password }, function(err, pass, salt, hash) {
        var user = {
            authId: 'local:' + req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName,
            email: req.body.email,
            since: new Date()
        };
        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, user, function(err, results) {
            if (err) {
                console.log(err);
                res.redirect('/auth/register');
            } else {
                req.login(user, function(err) {
                    req.session.save(function() {
                        res.redirect('/');
                    });
                });
            }
        });
    });
});

router.get('/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

router.get('/facebook/callback', passport.authenticate(
    'facebook', {
        failureRedirect: '/auth/login'
    }
), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    console.log("LOGOUT");
    req.logout();
    res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 회원가입 페이지로 못감
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
    return next();
    // 로그인이 안되어 있으면 진행

}



module.exports = router;