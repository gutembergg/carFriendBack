require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const PORT = 3001;

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require("./controllers/authController")(app);
require("./controllers/userController")(app);
require("./controllers/eventController")(app);

app.listen(process.env.PORT || PORT);

module.exports = app;
