const mongoose = require('mongoose');

const PetProfileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        weight: {
            type: Number,
            required: true,
        },
        activity: {
            type: String,
            enum: ['high', 'low', ''],
        },
        picture: {
            type: Number
        },
        breed: {
            type: String,
            enum: ['dog', 'cat'],
            required: true
        }
    },
    { strict: false },
);

module.exports = petprofile = mongoose.model('pet profiles', PetProfileSchema);
