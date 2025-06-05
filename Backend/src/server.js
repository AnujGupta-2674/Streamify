import express from 'express';
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import usersRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cors from 'cors';
import path from "path";

const app = express();
const port = process.env.PORT || 5000;

const __dirname = path.resolve();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    }
));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../Frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
    })
}


//Listening
app.listen(port, () => {
    console.log('Server is running on port ' + port);
    connectDB();
});