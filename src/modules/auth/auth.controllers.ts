import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../models/User";

import config from "../../config/index";

interface RequestWithUserId extends Request {
  userId: string;
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).send({ message: "Please fill in all fields" });

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: "email or password incorrect" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "email or password incorrect" });
    }

    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "30d",
    });

    res.cookie("Access-Token", accessToken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    res.cookie("Refresh-Token", refreshToken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });

    res.send({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).send({ message: "something went wrong" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ _id: (req as RequestWithUserId).userId });
    if (user) {
      res.cookie("Access-Token", "", {
        sameSite: "none",
        httpOnly: true,
        secure: true,
      });
      res.cookie("Refresh-Token", "", {
        sameSite: "none",
        httpOnly: true,
        secure: true,
      });
      return res.status(200).send({ message: "logged out" });
    }
    res.status(404).send({ message: "user not found" });
  } catch (e) {
    res.status(500).send({ message: "something went wrong" });
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).send({
        message: "Email, password and username are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "A user with this email already exists",
      });
    }

    const user = new User({ email, password, username, refreshToken: "" });
    await user.save();

    // Generate JWT access token
    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "15m",
    });

    // Generate JWT refresh token
    const refreshToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: "30d",
    });

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("Access-Token", accessToken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    res.cookie("Refresh-Token", refreshToken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });

    res.send({
      message: "Successfully registered",
    });
  } catch (e) {
    res.status(500).send({ message: "something went wrong" });
  }
};

export const getUserInfo = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as RequestWithUserId).userId;

    if (userId) {
      const user = await User.findOne({ _id: userId });
      const userData = { username: user?.username, email: user?.email };

      return res.status(200).send({ message: "success", data: userData });
    }

    res.status(200).send({ message: "no user", data: {} });
  } catch (e) {
    res.status(500).send({ message: "something went wrong" });
  }
};
