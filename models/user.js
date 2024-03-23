//models

const postgres = require('postgres')
//Definition of user schema
const userSchema = new postgres.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
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
})

const User = postgres.model('User', userSchema)
module.exports = User