const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statesSchema = new Schema ({
    stateCode: {
        type: String,
        required: true,
        unique: true
    },
    funfacts: {
        type: [String]
    }
});

module.exports = mongoose.model('States', statesSchema);