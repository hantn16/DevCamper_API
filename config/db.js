const mongoose = require('mongoose');
const connectDb = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
};
module.exports = connectDb;
