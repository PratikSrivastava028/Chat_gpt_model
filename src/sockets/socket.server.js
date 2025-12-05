const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");
const { text } = require("express");
require("dotenv").config();

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

      const message = await messageModel.create({
        chat: messagePayLoad.chat,
        user: socket.user._id,
        content: messagePayLoad.content,
        role: "user",
      });

      const vectors = await aiService.generateVector(messagePayLoad.content);

      const queryMemoryResult = await queryMemory(vectors, 3, {user:socket.user._id});
      console.log("Query Memory Result:", queryMemoryResult);

      await createMemory({
        vectors: vectors,
        messageId: message._id,
        metadata: {
          chatId: messagePayLoad.chat,
          user: socket.user._id,
          text: messagePayLoad.content,
        },
      });

      const chatHistory = (await messageModel
        .find({
          chat: messagePayLoad.chat,
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()).reverse();

      const stm = chatHistory.map((item) => {
        //kyoki hume sirf content or role chahiye
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
    These are some previous messages from chat ,use them to generate response:
    ${queryMemoryResult.map((item) => item.metadata.text).join("\n")}`,
            },
          ],
        },
      ];

      console.log(ltm[0]);
      console.log(stm);

      const response = await aiService.generateResponse([...ltm, ...stm]);

      const responseMessage = await messageModel.create({
        chat: messagePayLoad.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVectors = await aiService.generateVector(response);
      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chatId: messagePayLoad.chat,
          user: socket.user._id,
          text: response,
        },
      });

      socket.emit("ai-msg-response", {
        content: response,
        chat: messagePayLoad.chat,
      });
    });
  });
}

module.exports = initSocketServer;
