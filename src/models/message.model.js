const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "model"], //enum bound krta  h ki isme sirf yehi do value hi ja skti h
      required: true,
    },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("Message", messageSchema);

module.exports = messageModel;
