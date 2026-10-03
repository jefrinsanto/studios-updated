const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    maxlength: 254,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  phone: {
    type: String,
    required: [true, "Contact number is required"],
    trim: true,
    maxlength: 20,
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    maxlength: 2000,
  },
  // Lets you find leads whose notification email failed (check in Atlas)
  emailStatus: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", ContactSchema);
