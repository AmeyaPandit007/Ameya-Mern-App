const fs = require("fs");
const path = require("path");
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const colors = require("colors");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const { config } = require("process");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));
// app.use(express.static(path.join("public")));
app.use(express.static(path.join(__dirname,'../Frontend/build')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST, PATCH , DELETE");
  next();
});

app.use("/api/places", placesRoutes); // => api/places/....

app.use("/api/users", usersRoutes);

// app.use((req,res,next) => {
//   res.sendFile(path.resolve(__dirname, 'public' , 'index.html'));
// });

app.get('*',(req,res) => {
  res.sendFile(path.join(__dirname,'../Frontend/build/index.html'))
})

// app.use((req, res, next) => {
//   const error = new HttpError("Could not find this route.", 404);
//   throw error;
// });

// Error handling middleware Function
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An Unknown error ocurred..!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vdu5xfx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected To database".cyan.bold);
    app.listen(process.env.PORT || 5000, (req, res) => {
      console.log(`Server is up and running on PORT 5000`.rainbow.bold);
    });
  })
  .catch((err) => {
    console.log(err);
  });
