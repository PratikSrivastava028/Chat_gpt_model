const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    //middleware for socket authentication
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      return next(new Error("Token not found!!"));
    }

    try {
      const decoded = await jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = userModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error("Token invalid!!"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-msg", async (messagePayLoad) => {
      console.log(messagePayLoad);

await messageModel.create({
  chat:messagePayLoad.chat,
  user:socket.user._id,
  content:messagePayLoad.content,
  role:"user"
})

const chatHistory = await messageModel.find({
  chat:messagePayLoad.chat,
});

      const response = await aiService.generateResponse(chatHistory.map(item=>{    //kyoki hume sirf content or role chahiye
  return {
    role:item.role,
     text:item.content
  }
  }));
      

await messageModel.create({
  chat:messagePayLoad.chat,
  user:socket.user._id,
  content:response,
  role:"model"
})

      socket.emit("ai-msg-response", {
        content: response,
        chat: messagePayLoad.chat,
      });
    });
  });
}

module.exports = initSocketServer;
