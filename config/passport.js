const LocalStrategy = require('passport-local').Strategy,
      bcrypt        = require('bcrypt-nodejs'),
      helper        = require('./helper'),
      User          = require('../app/models/user');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
          done(err, user);
      });
  });

  passport.use('local-signup', new LocalStrategy(
      {
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback: true
      },
      function (req, email, password, done) {
          if(!req.user) {
                User.findOne({'local.email' : email}, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That Email is already taken.'));
                    } else {
                        const form_vals = {
                            name     : req.body.name,
                            email    : email,
                            password : password
                        };

                        let new_user = new User;
                        if (helper.isValidName(req.body.name)) {
                            new_user.local.name = req.body.name;
                        } else {
                            return done(null, false, req.flash('signupMessage', 'Name field cannot contain number(s)!!!'),
                                req.flash('name', form_vals.name), req.flash('email', form_vals.email), req.flash('password', form_vals.password));
                        }
                        if (helper.isValidEmail(email)) {
                            new_user.local.email = email
                        } else {
                            return done(null, false, req.flash('signupMessage', 'Not valid email!!!' ),
                                req.flash('name', form_vals.name), req.flash('email', form_vals.email), req.flash('password', form_vals.password))
                        }
                        if (helper.isValidPassword(password)) {
                            new_user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
                        } else {
                            return done(null, false, req.flash('signupMessage', 'Weak password!!!'),
                                req.flash('name', form_vals.name), req.flash('email', form_vals.email), req.flash('password', form_vals.password))
                        }
                        new_user.save(function (err) {
                            if (err)
                                return done(err);
                            return done(null, new_user);
                        });
                    }
                });
          } else {
              return done(null, req.user);
        }
      }
  ));

  passport.use('local-login', new LocalStrategy(
      {
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback: true
      },
      function (req, email, password, done) {
          User.findOne({'local.email' : email}, function (err, user) {
              if (err)
                  return done(err);
              const form_vals = {
                  email    : email,
                  password : password
              };
              if (!user) {
                  return done(null, false, req.flash('loginMessage', 'No user found.'), req.flash('email', form_vals.email), req.flash('password', form_vals.password));
              }
              if (!user.validPassword(password)) {
                  return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'), req.flash('email', form_vals.email), req.flash('password', form_vals.password));
              }

              return done(null, user);
          });
      }));

      passport.use('local-reset', new LocalStrategy(
      {
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback: true
      },
      function (req, email, password, done) {
          console.log(req.body.email);
          User.findOne({'local.email': req.body.email}, function (err, user) {
              if (err)
                  return done(err);
              if (!user) {
                  return done(null, false, req.flash('resetMessage', 'No user found.'));
              }
              console.log(user.local.password);
              user.local.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));
              user.save();
              return done(null, user, req.flash('resetMessage', 'Your password has successfully been changed!'));
          });
      }));
};

