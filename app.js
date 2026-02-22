const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const errorHandler = require("./middleware/errorMiddleware")

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

//routes
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const authRoutes = require('./routes/authRoutes');
app.use("/api/v1/bookmarks/", bookmarkRoutes);
app.use("/api/v1/auth/", authRoutes);
app.use(errorHandler);


module.exports = app;