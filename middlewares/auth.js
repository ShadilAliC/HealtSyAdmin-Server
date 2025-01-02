import jwt from "jsonwebtoken";
import UserDb from "../models/user.model.js";


const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "No token provided or invalid token format, please login",
      });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          status: false,
          message: "Invalid or expired token",
        });
      }

      const user = await UserDb.findById(decoded._id);
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      req.user = user; 
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};


export default verifyToken;
