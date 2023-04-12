const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config();
const PetProfileCtrl = require('../controllers/pet-profile-ctrl')
const router = express.Router()
const passport = require('passport');
require('../strategy/passport')(passport);

const Joi = require('joi-plus');
const validEmail = Joi.string().max(256).min(1).email();
const validName = Joi.string().max(50).min(1).trim().escape();
const validWeight = Joi.number().min(0).max(500);
const validActivity = Joi.string().min(0).max(4).trim().escape();
const validPicture = Joi.number().min(-1).max(50);
const validBreed = Joi.string().min(0).max(3).trim().escape();

router.use(bodyParser.json());

router.post('/profile/create', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.body.email, { escapeHTML: true });
    error2 = validName.validate(req.body.name, { escapeHTML: true });
    error3 = validWeight.validate(req.body.weight, { escapeHTML: true });
    error4 = validActivity.validate(req.body.activity, { escapeHTML: true });
    error5 = validPicture.validate(req.body.picture, { escapeHTML: true });
    error6 = validBreed.validate(req.body.breed, { escapeHTML: true });
    
    if(error1.error != null || error2.error != null || error3.error != null || error4.error != null || error5.error != null || error6.error != null){
        res.status(400).send('Invalid input');
    } else {
        profile = req.body
        PetProfileCtrl.createProfile(req, res, profile)
    }
});

router.delete('/profile/delete/:email/:name', passport.authenticate('jwt', {session: false}), (req, res) => {

    error1 = validEmail.validate(req.params.email, { escapeHTML: true });
    error2 = validName.validate(req.params.name, { escapeHTML: true });

    if (error1.error != null || error2.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        petname = req.params.name
        PetProfileCtrl.deleteProfile(req, res, email, petname)
    }
});

router.get('/profile/getall/:email', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });
    if (error1.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        PetProfileCtrl.getAllProfiles(req, res, email)
    }
});

router.get('/profile/getone/:email/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });
    error2 = validName.validate(req.params.name, { escapeHTML: true });

    if (error1.error != null || error2.error != null) {
        res.status(400).send('Invalid input');
    } else {
        email = req.params.email
        petname = req.params.name
        PetProfileCtrl.getOneProfile(req, res, email, petname)
    }
});

router.post('/profile/edit/:email/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validEmail.validate(req.params.email, { escapeHTML: true });
    error2 = validName.validate(req.params.name, { escapeHTML: true });
    error3 = {error: null}
    error4 = {error: null}
    error5 = {error: null}
    error6 = {error: null}
    error7 = {error: null}

    if(req.body.weight){
        error3 = validWeight.validate(req.body.weight, { escapeHTML: true });
    }
    if(req.body.activity){
        error4 = validActivity.validate(req.body.activity, { escapeHTML: true });
    }
    if(req.body.picture){
        error5 = validPicture.validate(req.body.picture, { escapeHTML: true });
    }
    if(req.body.breed){
        error6 = validBreed.validate(req.body.breed, { escapeHTML: true });
    }
    if(req.body.name){
        error7 = validBreed.validate(req.body.name, { escapeHTML: true });
    }

    if (error1.error != null || error2.error != null || error3.error != null || error4.error != null || error5.error != null || error6.error != null) {
        res.status(400).send('Invalid input');
    } else {
        PetProfileCtrl.editProfile(req, res, req.params.email, req.params.name, req.body)
    }
});

module.exports = router
