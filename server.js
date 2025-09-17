const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

const bookmarkRoutes = require('./routes/bookmarkRoutes');
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(express.json());
app.use(cors());

//other routes
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/auth',authRoutes);

//DATABASE CONNECTION
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);

    } catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
connectDB();

// Simple "Hello World" API endpoint
// app.get('/', (req, res) => {
//     // console.log('hello from bookmark manager backend!!');
//     res.send('hello from the backend!!');
// });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);   
});