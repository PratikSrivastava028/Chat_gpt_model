const chatModel = require("../models/chat.model");
const authMiddleware = require("../middleware/auth.middleware");

async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title
  });

  res.status(201).json({
    msg: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    }
  });
}

module.exports = {createChat};
