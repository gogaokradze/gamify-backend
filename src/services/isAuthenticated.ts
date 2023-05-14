import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import config from "../config";

interface JwtPayload {
  userId: string;
}
interface RequestWithUserId extends Request {
  userId: string;
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies["Access-Token"];
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, config.jwtSecret) as JwtPayload;
      (req as RequestWithUserId).userId = decoded.userId;
    } catch (e) {
      refresh(req, res);
    }
  }
  next();
}

function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies["Refresh-Token"];
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as JwtPayload;
      const accessToken = jwt.sign({ userId: decoded.userId }, config.jwtSecret, {
        expiresIn: "15m",
      });
      (req as RequestWithUserId).userId = decoded.userId;
      res.cookie("Access-Token", accessToken, {
        sameSite: "none",
        httpOnly: true,
        secure: true,
      });
    } catch (e) {}
  }
}
