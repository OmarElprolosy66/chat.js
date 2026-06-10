import jwt from "jsonwebtoken";
// import jwksClient from "jwks-rsa"; // TODO
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/auth.util";
import dotenv from "dotenv"; dotenv.config();

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        req.user = verifyToken(token);
        console.log(req.user);
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// TODO: Setup JWKS client for Google
// const client = jwksClient({
//   jwksUri: "https://www.googleapis.com/oauth2/v3/certs"
// });

// function getKey(header, callback) {
//   client.getSigningKey(header.kid, (err, key) => {
//     const signingKey = key.getPublicKey();
//     callback(null, signingKey);
//   });
// }

export default authenticateJWT;