const express = require('express');
const userModel = require('./models/user.model');
const authRoutes = require('./routes/auth.routes')
const cookieParser  = require('cookie-parser')
const chatRoutes = require('./routes/chat.routes')

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;