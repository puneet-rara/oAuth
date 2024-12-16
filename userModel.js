const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
      },
      displayName: {
        type: String,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      profilePicture: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    });

module.exports = mongoose.model("User",userSchema);