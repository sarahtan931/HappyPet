require('dotenv').config();
const axios = require('axios');
const apiKey = process.env.API_KEY;
const host = process.env.HOST;
const Food = require('../models/food-model');
const stringSimilarity = require('string-similarity')

async function getPetProfiles(req) {
    return (axios.get(
        `http://${host}:3000/profile/getall/${req.user.email}`,
        { headers: { Authorization: req.headers.authorization } }
    )).then(res => res.data);
}

function evaluateNutritionDogs(weight, activityLevel, picture) {
    RER = Math.pow((weight / 2.2), 0.75) * 70;
    let adj_RER = 0;

    if (activityLevel === "high") {
        adj_RER = 2 * RER;
    } else if (activityLevel === "low") {
        adj_RER = 1.3 * RER;
    } else {
        adj_RER = 1.6 * RER;
    }

    output = {
        petType: "dog",
        calorieLimit: adj_RER,
        fatLimit: (0.20 * adj_RER)/9.0,
        proteinLimit: weight, //1g/1lbs body weight
        carbsLimit: (0.50 * adj_RER)/4.0, 
        picture: picture
    }
    return output;
}

function evaluateNutritionCats(weight, activityLevel, picture) {
    RER = Math.pow((weight / 2.2), 0.75) * 70;
    let adj_RER = 0;

    if (activityLevel === "high") {
        adj_RER = 1.4 * RER;
    } else if (activityLevel === "low") {
        adj_RER = 1 * RER;
    } else {
        adj_RER = 1.2 * RER;
    }

    output = {
        petType: "cat",
        calorieLimit: adj_RER,
        fatLimit: (0.40 * adj_RER)/9.0,
        proteinLimit: weight, //2g/1lbs body weight
        carbsLimit: (0.15 * adj_RER)/4.0, 
        picture: picture
    }
    return output;
}

function processPetProfiles(profiles) {
    let output = {};
    profiles.forEach(profile => {
        if (profile.breed === "dog") {
            currOutput = evaluateNutritionDogs(profile.weight, profile.activity, profile.picture);
            output[profile.name] = {};
            output[profile.name] = currOutput;
        } else if (profile.breed === "cat") {
            currOutput = evaluateNutritionCats(profile.weight, profile.activity, profile.picture);
            output[profile.name] = {};
            output[profile.name] = currOutput;
        } else {
            //do nothing
        }
    })

    return output;
}

//localhost:3000/search/onion
function getFoods(req, res, fooditem) {
    output = []

    requestProduct = {
        method: 'GET',
        url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/products/search',
        params: {
            query: fooditem
        },
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            "Content-Type": "application/json",
            "Accept-Encoding": "decompress"
        }
    }

    requestIngredient = {
        method: 'GET',
        url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients/search',
        params: {
            query: fooditem
        },
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            "Content-Type": "application/json",
            "Accept-Encoding": "decompress"
        }
    }

    axios.request(requestProduct)
        .then((responseProduct) => {

            axios.request(requestIngredient)
                .then((responseIngredient) => {

                    responseIngredient.data.results.forEach(ingredient => {

                        data = {
                            name: ingredient.name,
                            image: ingredient.image,
                            id: ingredient.id,
                            isIngredient: true
                        }

                        output.push(data)
                    });

                    responseProduct.data.products.forEach(product => {

                        data = {
                            name: product.title,
                            image: product.image,
                            id: product.id,
                            isIngredient: false
                        }

                        output.push(data)
                    })

                    res.send(output);
                })
                .catch((err) => {
                    return res.status(400).json({ success: false, error: err });
                })
        }).catch((err) => {
            console.log(err);
        });
}


//localhost:3000/search/upc/041631000564
async function getUPC(req, res, upc) {
    requestUPC = {
        method: 'GET',
        url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/products/upc/${upc}`,
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            "Content-Type": "application/json",
            "Accept-Encoding": "decompress"
        }
    }

    let petProfiles = await getPetProfiles(req);
    let petProfileList = processPetProfiles(petProfiles);

    Food.find({})
        .then(foods => {
            axios.request(requestUPC)
                .then((responseUPC) => {

                    if (responseUPC.data.status != "failure") {

                        problem_dogs = []
                        problem_cats = []
                        ingredients = responseUPC.data.ingredients
                        generalSafety_dogs = "safe"
                        generalSafety_cats = "safe"
                        nutritionData = {
                            calories: responseUPC.data.nutrition.calories,
                            fat: responseUPC.data.nutrition.fat,
                            protein: responseUPC.data.nutrition.protein,
                            carbs: responseUPC.data.nutrition.carbs
                        }

                        ingredients.forEach(ingredient => {
                            foods.forEach(food => {
                                if (ingredient.name.toLowerCase().includes(food.name.toLowerCase())) {

                                    checkArray_dogs = problem_dogs.map(x => x.name);
                                    checkArray_cats = problem_cats.map(x => x.name);

                                    if (!checkArray_dogs.includes(food.name)) {
                                        safety = ""
                                        if (food.isToxic_dogs) {
                                            safety = "notsafe"
                                            generalSafety_dogs = "notsafe"
                                            console.log(food.name, ingredient.name)
                                            data = {
                                                name: ingredient.name,
                                                safety: safety,
                                                description: food.description_dogs
                                            }

                                            problem_dogs.push(data)
                                        } else if (food.isSafe_dogs && !food.isToxic_dogs) {
                                            safety = "safe"
                                        } else if (!food.isSafe_dogs && !food.isToxic_dogs) {
                                            safety = "caution"

                                            if (generalSafety_dogs == "safe") {
                                                generalSafety_dogs = "caution"
                                            }

                                            data = {
                                                name: ingredient.name,
                                                safety: safety,
                                                description: food.description_dogs,
                                            }

                                            problem_dogs.push(data)
                                        }
                                    }

                                    if (!checkArray_cats.includes(food.name)) {
                                        safety = ""
                                        if (food.isToxic_cats) {
                                            safety = "notsafe"
                                            generalSafety_cats = "notsafe"
                                            console.log(food.name, ingredient.name)
                                            data = {
                                                name: ingredient.name,
                                                safety: safety,
                                                description: food.description_cats
                                            }

                                            problem_cats.push(data)
                                        } else if (food.isSafe_cats && !food.isToxic_cats) {
                                            safety = "safe"
                                        } else if (!food.isSafe_cats && !food.isToxic_cats) {
                                            safety = "caution"

                                            if (generalSafety_cats == "safe") {
                                                generalSafety_cats = "caution"
                                            }

                                            data = {
                                                name: ingredient.name,
                                                safety: safety,
                                                description: food.description_cats,
                                            }

                                            problem_cats.push(data)
                                        }
                                    }

                                }
                            });
                        });

                        output = {
                            name: responseUPC.data.title,
                            image: responseUPC.data.image,
                            id: responseUPC.data.id,
                            ingredients: ingredients,
                            problemIngredients_dogs: problem_dogs,
                            isIngredient: false,
                            safety_dogs: generalSafety_dogs,
                            problemIngredients_cats: problem_cats,
                            safety_cats: generalSafety_cats,
                            nutrition: nutritionData,
                            servings: responseUPC.data.servings,
                            petProfiles: petProfileList
                        }

                        res.send(output)
                    } else {
                        return res.status(404).json({ success: false });
                    }

                })
                .catch((err) => {
                    return res.status(400).json({ success: false, error: err });
                })
        })
        .catch((err) => {
            console.log(err)
            return res.status(400).json({ success: false, error: err });
        })

}


//localhost:3000/search/info/products/201283
async function getInformationProduct(req, res, id) {


    requestProductIngredients = {
        method: 'GET',
        url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/products/${id}`,
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            "Content-Type": "application/json",
            "Accept-Encoding": "decompress"
        }
    }

    let petProfiles = await getPetProfiles(req);
    let petProfileList = processPetProfiles(petProfiles);

    Food.find({})
        .then(foods => {
            axios.request(requestProductIngredients)
                .then((responseProductIngredients) => {

                    problem_dogs = []
                    problem_cats = []
                    ingredients = responseProductIngredients.data.ingredients
                    generalSafety_dogs = "safe"
                    generalSafety_cats = "safe"
                    nutritionData = {
                        calories: responseProductIngredients.data.nutrition.calories,
                        fat: responseProductIngredients.data.nutrition.fat,
                        protein: responseProductIngredients.data.nutrition.protein,
                        carbs: responseProductIngredients.data.nutrition.carbs
                    }

                    ingredients.forEach(ingredient => {
                        foods.forEach(food => {
                            if (ingredient.name.toLowerCase().includes(food.name.toLowerCase())) {

                                checkArray_dogs = problem_dogs.map(x => x.name);
                                checkArray_cats = problem_cats.map(x => x.name);

                                if (!checkArray_dogs.includes(food.name)) {
                                    safety = ""
                                    if (food.isToxic_dogs) {
                                        safety = "notsafe"
                                        generalSafety_dogs = "notsafe"
                                        data = {
                                            name: ingredient.name,
                                            safety: safety,
                                            description: food.description_dogs
                                        }

                                        problem_dogs.push(data)
                                    } else if (food.isSafe_dogs && !food.isToxic_dogs) {
                                        safety = "safe"
                                    } else if (!food.isSafe_dogs && !food.isToxic_dogs) {
                                        safety = "caution"

                                        if (generalSafety_dogs == "safe") {
                                            generalSafety_dogs = "caution"
                                        }
                                        data = {
                                            name: ingredient.name,
                                            safety: safety,
                                            description: food.description_dogs
                                        }

                                        problem_dogs.push(data)
                                    }
                                }

                                if (!checkArray_cats.includes(food.name)) {
                                    safety = ""
                                    if (food.isToxic_cats) {
                                        safety = "notsafe"
                                        generalSafety_cats = "notsafe"
                                        data = {
                                            name: ingredient.name,
                                            safety: safety,
                                            description: food.description_cats
                                        }

                                        problem_cats.push(data)
                                    } else if (food.isSafe_cats && !food.isToxic_cats) {
                                        safety = "safe"
                                    } else if (!food.isSafe_cats && !food.isToxic_cats) {
                                        safety = "caution"
//181494
                                        if (generalSafety_cats == "safe") {
                                            generalSafety_cats = "caution"
                                        }
                                        data = {
                                            name: ingredient.name,
                                            safety: safety,
                                            description: food.description_cats
                                        }

                                        problem_cats.push(data)
                                    }
                                }

                            }
                        });
                    });

                    output = {
                        ingredients: ingredients,
                        problemIngredients_dogs: problem_dogs,
                        safety_dogs: generalSafety_dogs,
                        problemIngredients_cats: problem_cats,
                        safety_cats: generalSafety_cats,
                        nutrition: nutritionData,
                        servings: responseProductIngredients.data.servings,
                        petProfiles: petProfileList
                    }
                    res.send(output)

                }).catch((err) => {
                    return res.status(400).json({ success: false, error: err });
                })

        })
        .catch(err => {
            return res.status(400).json({ success: false, error: err });
        })
}

//localhost:3000/search/info/ingredients/id/19081
async function getInformationIngredientId(req, res, id) {


    requestIngredientInformation = {
        method: 'GET',
        url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients/${id}/information?amount=100&unit=g`,
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            "Content-Type": "application/json",
            "Accept-Encoding": "decompress"
        }
    }

    let petProfiles = await getPetProfiles(req);
    let petProfileList = processPetProfiles(petProfiles);

    Food.find({})
        .then(foods => {
            axios.request(requestIngredientInformation)
                .then((responseIngredientInformation) => {

                    safety_dogs = ""
                    description_dogs = ""
                    safety_cats = ""
                    description_cats = ""
                    percentage = 0
                    nutritionData = {
                        calories: -1,
                        fat: -1,
                        protein: -1,
                        carbs: -1
                    }

                    responseIngredientInformation.data.nutrition.nutrients.forEach(nutrient => {
                        if (nutrient.name === "Calories") {
                            nutritionData.calories = nutrient.amount;
                        } else if (nutrient.name === "Fat") {
                            nutritionData.fat = nutrient.amount.toString()+"g";
                        } else if (nutrient.name === "Protein") {
                            nutritionData.protein = nutrient.amount.toString()+"g";
                        } else if (nutrient.name === "Carbohydrates") {
                            nutritionData.carbs = nutrient.amount.toString()+"g";
                        } else {
                            //do nothing
                        }
                    });

                    foods.forEach(food => {
                        if (responseIngredientInformation.data.name.toLowerCase().includes(food.name.toLowerCase())) {
                            newPercentage = stringSimilarity.compareTwoStrings(responseIngredientInformation.data.name.toLowerCase(), food.name.toLowerCase())
        
                            if (newPercentage > percentage) {
                                percentage = newPercentage
                                //dogs
                                if (food.isToxic_dogs) {
                                    safety_dogs = "notsafe"
                                } else if (food.isSafe_dogs && !food.isToxic_dogs) {
                                    safety_dogs = "safe"
                                } else if (!food.isSafe_dogs && !food.isToxic_dogs) {
                                    safety_dogs = "caution"
                                }
        
                                description_dogs = food.description_dogs
        
                                //cats
                                if (food.isToxic_cats) {
                                    safety_cats = "notsafe"
                                } else if (food.isSafe_cats && !food.isToxic_cats) {
                                    safety_cats = "safe"
                                } else if (!food.isSafe_cats && !food.isToxic_cats) {
                                    safety_cats = "caution"
                                }
        
                                description_cats = food.description_cats
                            }
                        }
                    });

                    output = {
                        safety_dogs: safety_dogs,
                        description_dogs: description_dogs,
                        safety_cats: safety_cats,
                        description_cats: description_cats,
                        nutrition: nutritionData,
                        servings: responseIngredientInformation.data.nutrition.weightPerServing,
                        petProfiles: petProfileList
                    }
                    res.send(output)

                }).catch((err) => {
                    return res.status(400).json({ success: false, error: err });
                })

        })
        .catch(err => {
            return res.status(400).json({ success: false, error: err });
        })
}


//localhost:3000/search/info/ingredients/chocolate
function getInformationIngredient(req, res, ingredient) {

    Food.find({})
        .then(foods => {
            safety_dogs = ""
            description_dogs = ""
            safety_cats = ""
            description_cats = ""
            percentage = 0

            foods.forEach(food => {
                if (ingredient.toLowerCase().includes(food.name.toLowerCase())) {

                    newPercentage = stringSimilarity.compareTwoStrings(ingredient.toLowerCase(), food.name.toLowerCase())

                    if (newPercentage > percentage) {
                        percentage = newPercentage
                        //dogs
                        if (food.isToxic_dogs) {
                            safety_dogs = "notsafe"
                        } else if (food.isSafe_dogs && !food.isToxic_dogs) {
                            safety_dogs = "safe"
                        } else if (!food.isSafe_dogs && !food.isToxic_dogs) {
                            safety_dogs = "caution"
                        }

                        description_dogs = food.description_dogs

                        //cats
                        if (food.isToxic_cats) {
                            safety_cats = "notsafe"
                        } else if (food.isSafe_cats && !food.isToxic_cats) {
                            safety_cats = "safe"
                        } else if (!food.isSafe_cats && !food.isToxic_cats) {
                            safety_cats = "caution"
                        }

                        description_cats = food.description_cats
                    }
                }
            });

            output = {
                safety_dogs: safety_dogs,
                description_dogs: description_dogs,
                safety_cats: safety_cats,
                description_cats: description_cats
            }

            res.send(output)

        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ success: false, error: err });
        })
}



module.exports = { getFoods, getInformationProduct, getInformationIngredientId, getInformationIngredient, getUPC };
