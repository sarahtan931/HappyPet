require('dotenv').config();
const PetProfile = require('../models/pet-profile-model');

function createProfile(req, res, profile){

    profile.name = profile.name.toLowerCase()
    PetProfile.findOne({email: profile.email, name: profile.name}).then((data) =>{
        if(data){
            return res.status(400).send("Profile already exists")
        } else {
            const petProfile = new PetProfile(profile)
            petProfile.save(function (err) {
                if (err){
                    console.log(err);
                    return res.status(500).send("Could not create profile")
                }
        
                return res.status(200).json({ success: true, petProfile});
              });
        }
    }).catch((err) => {
        console.log(err)
        return res.status(500).send("Could not create profile")
    })
}

function deleteProfile(req, res, email, petname){

    petname = petname.toLowerCase()
    PetProfile.findOneAndDelete({email: email, name: petname}).then((profile) => {
        return res.status(200).send(`Successfully deleted ${petname}'s profile for ${email}`)
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not delete profile")
    });
}

function getAllProfiles(req, res, email){

    PetProfile.find({email: email}).then((data) => {
        return res.status(200).send(data)
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not find profiles")
    });
}

function getOneProfile(req, res, email, petname){

    petname = petname.toLowerCase()
    PetProfile.findOne({email: email, name: petname}).then((data) => {
        return res.status(200).send(data)
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not find profile")
    });
}

function editProfile(req, res, email, petname, body){

    if(body.name){
        body.name = body.name.toLowerCase()
    }
    petname = petname.toLowerCase()
    PetProfile.findOne({email: email, name: body.name}).then((data) =>{
        if(data){
            return res.status(400).send('Duplicate profile already exists')
        } else {
            PetProfile.findOneAndUpdate({email: email, name: petname}, body).then((data) => {

                if(data){
                    return res.status(200).send(data)
                } else {
                    return res.status(500).send("Could not update profile")
                }
                
            }).catch((err) =>{
                console.log(err)
                return res.status(500).send("Could not update profile")
            });
        }
    })
}

module.exports = { createProfile, deleteProfile, getAllProfiles, getOneProfile, editProfile };
