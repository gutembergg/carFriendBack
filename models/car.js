const mongoose = require('../database');

const carSchema = new mongoose.Schema({
    carName: {
        type: String,
    },
    seats: {
        type: Number,
    },
    contact: {
        type: String,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    },
    address: {
        type: String,
    },
    date: {
        type: String,
    },
    time: {
        type: String,
    },
    passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Passenger" }]

});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;