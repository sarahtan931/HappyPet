const bcrypt = require('bcrypt');
const User = require('../models/user-model.js');
const loginPass = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Local Strategy
loginPass.use('login',
    new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
      // Match User
      User.findOne({email: email})
          .then((user) => {
            if (!user) {
              throw new Error('Login failed');
              // Return other user
            } else {
              // Match password
              bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                  return done(null, user);
                } else {
                  return done(null, false, {message: 'Wrong password'});
                }
              });
            }
          })
          .catch((err) => {
            return done(null, false, {message: err});
          });
    }),
);

module.exports = loginPass;