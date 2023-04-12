const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Food = new Schema(
    {
        name: { type: String, required: true },
        isToxic_dogs: { type: Boolean, required: true },
        isSafe_dogs: { type: Boolean, required: true },
        description_dogs: { type: String, required: true },
        isToxic_cats: { type: Boolean, required: true },
        isSafe_cats: { type: Boolean, required: true },
        description_cats: { type: String, required: true },
    },
    { collection: 'food' },
    { timestamps: true },
)

module.exports = mongoose.model('food', Food)