const { Schema, model } = require("mongoose");

const sessionSchema = new Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const Session = model("session", sessionSchema);

module.exports = Session;
