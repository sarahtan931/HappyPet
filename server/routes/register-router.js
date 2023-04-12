const passport = require('passport');
const register = require('../strategy/register.js');
require('../strategy/passport.js')(passport);
const utils = require('../strategy/utils.js');
const sanitizeHtml = require('sanitize-html');
const Joi = require('joi-plus');
const validEmail = Joi.string().max(256).min(1).email();
const validPass = Joi.string().max(20).min(6).trim().escape();
const validName = Joi.string().max(500).min(1).trim().escape().sanitize(sanitizeHtml);

const User = require('../models/user-model.js');

const express = require('express');
const router = new express.Router();

// register
router.post('/register', (req, res, next) => {
  const username = req.body.name;

  error1 = validEmail.validate(req.body.email, {escapeHTML: true});
  error2 = validPass.validate(req.body.password, {escapeHTML: true});
  error3 = validName.validate(req.body.name, {escapeHTML: true});

  if (error1.error != null || error2.error != null || error3.error != null) {
    res.status(401).send('Invalid input');
  } else {
    register.authenticate('local', function(err, user, info) {
        if (err) {
          res.status(400).send('Email already registered');
      } else if (!user) {
          res.status(400).send('Email already registered');
      } else {
        User.updateOne({email: user.email}, {name: username}, function(err, result) {
          if (err) {
            console.log(err);
            res.status(400).send('Username save failed');
          } else {
            const jwt = utils.issueJWT(user);
            output = {success: `logged in ${user.email}`, user: user, token: jwt.token, expiresIn: jwt.expires, email: user.email};
            res.status(200).send(output);
          }
        });
      }
    })(req, res, next);
  }
});

router.get('/check/:email', (req, res, next) => {
  const email = req.params.email;
  error1 = validEmail.validate(email, {escapeHTML: true});
  if (error1.error != null) {
    res.status(401).send('Invalid input');
  } else {
    User.findOne({email: email})
        .then((user) => {
          console.log(user);
          if (user == null) {
            // The user does not exist
            output = {
              isUser: false,
            };
            res.status(200).send(output);
          } else {
            // The user exists, account cannot be made
            output = {
              isUser: true,
            };
            res.status(200).send(output);
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send('Something went wrong');
        });
  }
});

module.exports = router;
