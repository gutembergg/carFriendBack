const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || "localhost";
mongoose.connect(`mongodb://${MONGO_URL}/caroster_v2`, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

mongoose.Promise = global.Promise;

mongoose.connection.on("connected", err => {
    if (err) throw err;
    console.log("Connected to Database");
  });
  

module.exports = mongoose;