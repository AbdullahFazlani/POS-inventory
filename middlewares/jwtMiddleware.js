import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req?.header("Authorization")?.substring(7);

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  //   console.log("token", token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
