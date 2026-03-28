import { User as userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    const isUserALreadyExists = await userModel.findOne({
      $or: [{ email }, { username }]
    });

    if (isUserALreadyExists) {
      return res.status(409).json({ message: "user already exists" });
    }

    const user = await userModel.create({ email, username, password });

    const token = createToken(user._id, user.username);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      message: "user registered successfully",
      user: { username: user.username, id: user._id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!password || (!email && !username)) {
      return res.status(400).json({ message: "email/username and password required" });
    }

    const user = await userModel.findOne({
      $or: [{ email }, { username }]
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = createToken(user._id, user.username);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "user logged in successfully",
      user: { username: user.username, id: user._id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMe(req, res) {
   
    const user = await userModel.findById(req.user.id).select("-password"); 

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
        message: "user fetched successfully",
        user
    })
}

async function logout(req, res) {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "lax"
    });

    return res.status(200).json({ message: "Logged out successfully" });
}

export {
    register,
    login,
    getMe,
    logout
};