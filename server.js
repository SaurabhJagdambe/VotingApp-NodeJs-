const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
// const passport = require("./auth");

// body parser - to parse the data
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const PORT = process.env.PORT || 3001;

//Route for User
const userRoute = require("./routes/userRoute");
app.use("/user", userRoute);

//Route for Candidate
const candidateRoute = require("./routes/candidateRoute");
app.use("/candidate", candidateRoute);

//port listning
app.listen(PORT, () => {
  console.log("Listning to port 3001");
});
