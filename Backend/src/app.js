const express = require('express');
const userModel = require('./models/user.model');
const authRoutes = require('./routes/auth.routes')
const cookieParser  = require('cookie-parser')
const chatRoutes = require('./routes/chat.routes')
const cors  = require("cors")

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow local dev origins (adjust or add origins as needed)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true); // allow non-browser tools like curl/postman
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true
}));
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;