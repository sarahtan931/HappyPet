const bcrypt = require('bcrypt');
const User = require('../models/user-model.js');
const registerPass = require('passport');
const LocalStrategy = require('passport-local').Strategy;

registerPass.use(
    new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
      // Check if email already in use
      User.findOne({email: email})
          .then((user) => {
            // Create new User
            if (!user) {
              const newUser = new User({email, password});
              // Hash password before saving in database
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser.save().then((data) => {
                    return done(null, newUser);
                  });
                });
              });
            } else {
              // duplicate email
              throw new Error('Email already in use');
            }
          })
          .catch((err) => {
            return done(null, false, {message: err});
          });
    }),
);

module.exports = registerPass;