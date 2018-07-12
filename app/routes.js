module.exports = function (app, passport) {

    // show Home page
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    // show users's profile if the user is authenticated
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', { user: req.user });
    });

    // logout from the profile
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // show signup view
    app.get('/signup', function (req, res) {
        req.logout();
        res.render('signup.ejs', {
            message   : req.flash('signupMessage'),
            name      : req.flash('name'),
            email     : req.flash('email'),
            password  : req.flash('password')
        });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash    : true
    }));

    // show login view
    app.get('/login', function (req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage'),
            email     : req.flash('email'),
            password  : req.flash('password')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash    : true
    }));


    // show reset password view
    app.get('/resetpass', function (req, res) {
        res.render('resetpass.ejs', {message: req.flash('resetMessage')});
    });

    app.post('/resetpass', passport.authenticate('local-reset', {
        successRedirect : '/resetpass',
        failureRedirect : '/resetpass',
        failureFlash    : true,
    }));
};

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated())
        return next();
    res.redirect('/');
}