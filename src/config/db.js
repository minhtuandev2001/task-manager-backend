const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL)
    console.log("Connected to mongodb ", conn.connection.host);
  } catch (error) {
    console.log("Connection error:", error);
  }
}
module.exports = connectDB