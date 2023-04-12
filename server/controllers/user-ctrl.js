require('dotenv').config();
const User = require('../models/user-model');

function getUserHistory(req, res, email) {
    User.findOne({email: email}).then((data) => {
        return res.status(200).send(data.history)
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not find profile")
    });
}

function addUserHistory(req, res, email, body) {
    User.findOne({email: email}).then((data) =>{
        if(data){
            let currentHistory = data.history;
            currentHistory.push({"search": body.item, "searchType": body.type});
            if (currentHistory.length > 10) {
                currentHistory.shift();
            }
            User.findOneAndUpdate({email: email}, { history: currentHistory }).then((data) => {
                User.findOne({email: email}).then((data) => {
                    return res.status(200).send(data.history)
                }).catch((err) =>{
                    console.log(err)
                    return res.status(500).send("Could not find profile")
                });
            }).catch((err) =>{
                console.log(err)
                return res.status(500).send("Could not update user")
            });
        } else {
            return res.status(500).send("User data does not exist")
        }
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not update user")
    });
}

function getUserFavourites(req, res, email) {
    User.findOne({email: email}).then((data) => {
        if(data){
            let currentFavourites = data.favourites;
            if (currentFavourites === undefined) {
                currentFavourites = {};
                User.findOneAndUpdate({email: email}, { favourites: currentFavourites }).then((data) => {
                    User.findOne({email: email}).then((data) => {
                        return res.status(200).send(data.favourites)
                    }).catch((err) =>{
                        console.log(err)
                        return res.status(500).send("Could not find profile")
                    });
                }).catch((err) =>{
                    console.log(err)
                    return res.status(500).send("Could not update user")
                });
            } else {
                return res.status(200).send(currentFavourites)
            }
        } else {
            return res.status(500).send("User data does not exist")
        }
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not find profile")
    });
}

function addUserFavourites(req, res, email, body) {
    User.findOne({email: email}).then((data) =>{
        if(data){
            let currentFavourites = data.favourites;
            if (currentFavourites === undefined) {
                currentFavourites = {};
            }
            if (currentFavourites.hasOwnProperty(body.id)) {
                return res.status(400).send("Favourite already exists")
            }
            currentFavourites[body.id] = {"name": body.name, "isSafeDog": body.isSafeDog, "isSafeCat": body.isSafeCat, "imageUrl": body.imageUrl, "isIngredient":body.isIngredient};
            User.findOneAndUpdate({email: email}, { favourites: currentFavourites }).then((data) => {
                User.findOne({email: email}).then((data) => {
                    return res.status(200).send(data.favourites)
                }).catch((err) =>{
                    console.log(err)
                    return res.status(500).send("Could not find profile")
                });
            }).catch((err) =>{
                console.log(err)
                return res.status(500).send("Could not update user")
            });
        } else {
            return res.status(500).send("User data does not exist")
        }
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not update user")
    });
}

function deleteUserFavourites(req, res, email, body) {
    User.findOne({email: email}).then((data) =>{
        if(data){
            let currentFavourites = data.favourites;
            if (currentFavourites === undefined) {
                currentFavourites = {};
            }
            if (currentFavourites.hasOwnProperty(body.id)) {
                delete currentFavourites[body.id];

                User.findOneAndUpdate({email: email}, { favourites: currentFavourites }).then((data) => {
                    User.findOne({email: email}).then((data) => {
                        return res.status(200).send(data.favourites)
                    }).catch((err) =>{
                        console.log(err)
                        return res.status(500).send("Could not find profile")
                    });
                }).catch((err) =>{
                    console.log(err)
                    return res.status(500).send("Could not update user")
                });
            } else {
                return res.status(400).send("Favourite does not exist")
            }
        } else {
            return res.status(500).send("User data does not exist")
        }
    }).catch((err) =>{
        console.log(err)
        return res.status(500).send("Could not update user")
    });
}


module.exports = { getUserHistory, addUserHistory, getUserFavourites, addUserFavourites, deleteUserFavourites };