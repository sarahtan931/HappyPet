const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config();
const UserCtrl = require('../controllers/user-ctrl')
const router = express.Router()
const passport = require('passport');
require('../strategy/passport')(passport);

const Joi = require('joi-plus');
const validEmail = Joi.string().max(256).min(1).email();

router.use(bodyParser.json());

router.get('/user/history/:email', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });

    if (error1.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        UserCtrl.getUserHistory(req, res, email)
    }
});

router.post('/user/history/add/:email', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });

    if (error1.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        UserCtrl.addUserHistory(req, res, req.params.email, req.body)
    }
});

router.get('/user/favourites/:email', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });

    if (error1.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        UserCtrl.getUserFavourites(req, res, email)
    }
});

router.post('/user/favourites/add/:email', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });

    if (error1.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        UserCtrl.addUserFavourites(req, res, email, req.body)
    }
});

router.post('/user/favourites/delete/:email', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });

    if (error1.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        UserCtrl.deleteUserFavourites(req, res, email, req.body)
    }
});

module.exports = router