import { upsertStreamUser } from "../lib/stream.js";
import userModel from "../models/User.js"
import blackListToken from "../models/BlacklistToken.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    const { email, password, fullName } = req.body;

    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 characters" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            const idx = Math.floor(Math.random() * 100) + 1;
            const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

            const hashedPassword = await userModel.hashPassword(password);

            const newUser = new userModel({
                email,
                fullName,
                password: hashedPassword,
                profilePic: randomAvatar,
            })
            await newUser.save();

            try {
                await upsertStreamUser({
                    id: newUser._id.toString(),
                    name: newUser.fullName,
                    image: newUser.profilePic || "",
                });
                console.log(`Stream user created for ${newUser.fullName}`);

            } catch (error) {
                console.log("Error creating Stream user", error);
            }

            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
            res.cookie("token", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSites: "strict",
                secure: process.env.NODE_ENV === 'production'
            });

            res.status(200).json({ success: true, user: newUser });
        } else {
            return res.status(400).json({ message: "Email already used" });
        }
    } catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email or Password is Incorrect" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email or Password is Incorrect" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSites: "strict",
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("Error in login controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logout = async (req, res) => {
    const token = req.cookies.token;

    await blackListToken.create({ token });
    
    res.clearCookie("token", {
        httpOnly: true,
        sameSites: "strict",
        secure: process.env.NODE_ENV === 'production'
    });
    res.status(200).json({ success: true, message: "Logged out Successfully" });
}

export const onboarding = async (req, res) => {
    try {
        const userId = req.user._id;

        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({ message: "All fields are required", missingFields: ["fullName", "bio", "nativeLanguage", "learningLanguage", "location"].filter(field => !req.body[field]) });
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, {
            fullName,
            bio,
            nativeLanguage,
            learningLanguage,
            location,
            isOnboarded: true
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });
            console.log("Stream user updated for", updatedUser.fullName);
        } catch (err) {
            console.log("Error in upserting Stream user during onboarding", err);
            return res.status(500).json({ message: "Internal Server Error while updating Stream user" });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.log("Error in onboarding controller", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getUser = async (req, res) => {
    res.status(200).json({ success: true, user: req.user });
}