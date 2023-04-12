// TODO: Add Photo Capabilities
export class PetProfile {
    constructor (name, email, weight, activity, breed, imageIndex = null, nutritionMaximums = null) {
        this.name = name;
        this.email = email;
        this.weight = weight;
        this.activity = activity;
        this.breed = breed;
        this.imageIndex = imageIndex;
        this.nutritionMaximums = nutritionMaximums;
    }
}

export const activityLevel = {
    LOW: "low",
    HIGH: "high",
    DEFAULT: ''
}

export const breedTypes = {
    CAT: 'cat',
    DOG: 'dog',
    UNSELECTED: ''
}

export class NutritionMaximums {
    constructor(caloriesLimit, proteinLimit, carbsLimit, fatLimit) {
        this.caloriesLimit = caloriesLimit;
        this.proteinLimit = proteinLimit;
        this.carbsLimit = carbsLimit;
        this.fatLimit = fatLimit;
    }
}
