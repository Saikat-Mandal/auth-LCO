const mongoose = require("mongoose");

const { MONGO_URL } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGO_URL)
    .then(console.log("db connected succesfully"))
    .catch((err) => {
      console.log("db connection failed");
      console.log(err);
      process.exit(1);
    });
};
