const mongoose = require('../database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Event" 
    }],
    passengerInEvent: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Event" 
    }],
    cars: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Car" 
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function(next) {

    if (this.isNew || this.isModified("password")) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    }
    
});

const User = mongoose.model('User', UserSchema);

module.exports = User;