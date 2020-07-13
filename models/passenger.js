const mongoose = require("../database");

const passengerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Passenger = mongoose.model("Passenger", passengerSchema);

module.exports = Passenger;
