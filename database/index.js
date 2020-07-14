const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost/caroster_v2";
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//mongodb://heroku_lv6v9mz2:3iit85ibbd3ro7hvtjmlan0v0h@ds351807.mlab.com:51807/heroku_lv6v9mz2

mongodb: mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

mongoose.Promise = global.Promise;

mongoose.connection.on("connected", err => {
    if (err) throw err;
    console.log("Connected to Database");
});

module.exports = mongoose;
