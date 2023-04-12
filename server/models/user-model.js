const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        favourites: {
            type: Object,
            required: false,
        },
        history: {
            type: [Object],
            required: false,
        }
    },
    { strict: false },
);

module.exports = user = mongoose.model('users', UserSchema);