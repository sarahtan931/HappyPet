const passport = require('passport');
const login = require('../strategy/login.js');
require('../strategy/passport')(passport);
const utils = require('../strategy/utils.js');
const express = require('express');
const Joi = require('joi-plus');
const router = new express.Router();
const User = require('../models/user-model.js');
const bcrypt = require('bcrypt');

const validEmail = Joi.string().max(256).min(1).email();
const validPass = Joi.string().max(100).min(6).trim().escape();

// login
router.post('/login', (req, res, next) => {
    error1 = validEmail.validate(req.body.email, { escapeHTML: true });
    error2 = validPass.validate(req.body.password, { escapeHTML: true });

    if (error1.error != null || error2.error != null) {
        res.status(401).send('Invalid input');
    } else {
        login.authenticate('login', function (err, user, info) {
            if (err) {
                res.status(400).send('Login failed');
            } else if (!user) {
                res.status(400).send('Login failed');
            } else {
                const jwt = utils.issueJWT(user);
                res.status(200).send({ success: `Logged in ${user.email}`, token: jwt.token, expiresIn: jwt.expires, email: user.email, name: user.name });
            }
        })(req, res, next);
    }
});

// change password
router.post('/login/changepassword', (req, res, next) => {
    error1 = validEmail.validate(req.body.email, { escapeHTML: true });
    error2 = validPass.validate(req.body.password, { escapeHTML: true });
    error3 = validPass.validate(req.body.newpassword, { escapeHTML: true });

    if (error1.error != null || error2.error != null || error3.error != null) {
        res.status(401).send('Invalid input');
    } else {
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    res.status(500).send('User does not exist');
                    return;
                }

                // Hash password before saving in database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.newpassword, salt, (err, hash) => {
                        if (err) throw err;
                        User.updateOne({ email: req.body.email }, { password: hash })
                            .then((user) => {
                                if (user) {
                                    return res.status(200).send('Success!');
                                }

                                res.status(500).send('Something went wrong 1');
                            })
                            .catch((err) => {
                                res.status(500).send('Something went wrong 2');
                            });
                    });
                });
            })
            .catch((err) => {
                res.status(500).send('Something went wrong 3');
            });
    }
});

// delete account
router.delete('/login/deleteaccount/:email', (req, res, next) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });

    if (error1.error != null) {
        res.status(401).send('Invalid input');
    } else {
        User.findOneAndDelete({ email: req.params.email })
            .then((user) => {
                if (!user) {
                    res.status(500).send('User does not exist');
                    return;
                }

                return res.status(200).send('Success!');
            })
            .catch((err) => {
                res.status(500).send('Something went wrong 3');
            });
    }
});
module.exports = router;