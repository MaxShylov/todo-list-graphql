const mongoose = require("mongoose");

const { DB_USER, DB_SECRET, DB_HOST, DB_NAME } = process.env;

const dbLink = (!DB_USER || !DB_SECRET || !DB_HOST || !DB_NAME)
  ? "localhost:27017/todo"
  : `${DB_USER}:${DB_SECRET}@${DB_HOST}/${DB_NAME}`;

mongoose.connect(
  `mongodb://${dbLink}`,
  { useNewUrlParser: true },
  (err) => err && console.log(err)
);

module.exports = mongoose;
