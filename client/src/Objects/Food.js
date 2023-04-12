import {PetProfile} from "./PetProfile";


export class Food {
    constructor(isIngredient, ingredients, dogIngredients, catsIngredients, dogSafetyClassification, catSafetyClassification, nutrition, servings, petProfiles, name) {
        this.isIngredient = isIngredient
        this.ingredients = ingredients; // an array of ingredient objects
        this.problemIngredientsDogs = dogIngredients; // an array of ingredient objects
        this.problemIngredientsCats = catsIngredients; // an array of ingredient objects
        this.safetyDogs = dogSafetyClassification; // Overall classification of safety
        this.safetyCats = catSafetyClassification;
        this.nutrition = nutrition;
        this.servings = servings;
        this.petProfiles = petProfiles;
        this.name = name
    }

    static bodyToFood(bodyObject, email, isIngredient, name) {
        let ingredients = bodyObject.ingredients;
        let problemIngredientsDogs = bodyObject.problemIngredients_dogs;
        let problemIngredientsCats = bodyObject.problemIngredients_cats;
        let safetyDogs = bodyObject.safety_dogs;
        let safetyCats = bodyObject.safety_cats;
        let nutrition = bodyObject.nutrition;
        let servings = bodyObject.servings;
        let petProfiles = bodyObject.petProfiles;

        if (safetyDogs == null || safetyCats == null || servings == null || petProfiles == null) {
            console.log('error');
            throw new Error('Malformed Body');
        }

        // Convert Ingredients
        if (!isIngredient) {
            if (ingredients != null) {
                ingredients = ingredients.map((i) => {
                    const name = i.name;
                    if (name == null) {
                        throw new Error('Missing Ingredient Name');
                    }
                    return new Ingredient(i.name);
                });
            }

            // Convert Problem Ingredients
            if (problemIngredientsDogs != null) {
                problemIngredientsDogs = problemIngredientsDogs.map((i) => {
                    const name = i.name;
                    const safety = i.safety === 'safe' ? safetyClassification.SAFE : i.safety === 'caution' ? safetyClassification.CAUTION : safetyClassification.NOTSAFE;
                    const description = i.description;

                    return new Ingredient(name, safety, description);
                });
            }

            if (problemIngredientsCats != null) {
                problemIngredientsCats = problemIngredientsCats.map((i) => {
                    const name = i.name;
                    const safety = i.safety === 'safe' ? safetyClassification.SAFE : i.safety === 'caution' ? safetyClassification.CAUTION : safetyClassification.NOTSAFE;
                    const description = i.description;

                    return new Ingredient(name, safety, description);
                });
            }
        } else {
            const descriptionDogs = bodyObject.description_dogs;
            const descriptionCats = bodyObject.description_cats;

            // The food itself is an ingredient
            if (safetyDogs === safetyClassification.CAUTION || safetyDogs === safetyClassification.NOTSAFE) {
                // Create ingredient and add it to unsafe dog ingredients
                problemIngredientsDogs = [];
                problemIngredientsDogs.push(new Ingredient(name, safetyDogs, descriptionDogs))
            }
            if (safetyCats === safetyClassification.CAUTION || safetyCats === safetyClassification.NOTSAFE) {
                // Create ingredient and add it to unsafe dog ingredients
                problemIngredientsCats = [];
                problemIngredientsCats.push(new Ingredient(name, safetyCats, descriptionCats));
            }
        }

        if ((ingredients != null && ingredients.length !== 0 && !isIngredient) || (isIngredient && safetyDogs != '' && safetyCats != '')) {
            // Convert safetyDogs
            safetyDogs = safetyDogs === 'safe' ? safetyClassification.SAFE : safetyDogs === 'caution' ? safetyClassification.CAUTION : safetyClassification.NOTSAFE;
            // Convert safetyCats
            safetyCats = safetyCats === 'safe' ? safetyClassification.SAFE : safetyCats === 'caution' ? safetyClassification.CAUTION : safetyClassification.NOTSAFE;
        } else {
            safetyCats = safetyClassification.UNSURE;
            safetyDogs = safetyClassification.UNSURE;
        }


        // Convert servings
        if (isIngredient) {
            servings = new Servings("1", servings.amount, servings.unit)
        }

        servings = new Servings(servings.number, servings.size, servings.unit);

        // Convert Nutrition
        function removeNonNumericEnd(str) {
            const regex = /^(\d+(?:\.\d+)?)(\D+)$/;
            const match = str.match(regex);
            if (match) {
                const nonNumeric = match[2];
                const numeric = match[1];
                return { nonNumeric, numeric };
            } else {
                return { nonNumeric: '', numeric: '' };
            }
        }

        if (nutrition.calories != null && nutrition.protein != null && nutrition.fat != null && nutrition.carbs != null) {
            nutrition = new Nutrition(nutrition.calories, +removeNonNumericEnd(nutrition.protein).numeric, +removeNonNumericEnd(nutrition.fat).numeric, +removeNonNumericEnd(nutrition.carbs).numeric, removeNonNumericEnd(nutrition.fat).nonNumeric);
        } else {
            nutrition = null;
        }


        // Convert Pet Profiles

        const petProfileObjects = []
        for (const [key, value] of Object.entries(petProfiles)) {
            const name = key;
            const breed = value.petType;
            const nutrition = new Nutrition(value.calorieLimit, value.proteinLimit, value.fatLimit, value.carbsLimit, 'g');
            const imageIndex = value.picture;
            petProfileObjects.push(new PetProfile(name, email, null, null, breed, imageIndex, nutrition));
        }

        return new Food(isIngredient, ingredients, problemIngredientsDogs, problemIngredientsCats, safetyDogs, safetyCats, nutrition, servings, petProfileObjects, name);
    }
}

export class Ingredient {
    constructor(name, safety, description) {
        this.name = name;
        this.safety = safety;
        this.description = description;
    }
}

export class Servings {
    constructor(number, size, units) {
        this.number = number;
        this.size = size;
        this.units = units;
        this.unit = units;
    }
}

export class Nutrition {
    constructor(calories, protein, fat, carbs, units) {
        this.calories = calories;
        this.protein = protein;
        this.fat = fat;
        this.carbs = carbs;
        this.units = units;
        this.unit = units;
    }
}

export const safetyClassification = {
    SAFE: 'safe',
    CAUTION: 'caution',
    NOTSAFE: 'notsafe',
    UNSURE: 'unsure'
}
