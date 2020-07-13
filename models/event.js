const mongoose = require("../database");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],

  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Passenger" }],
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
