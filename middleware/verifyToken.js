const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token is required." });
  }

  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!decoded.username) {
      throw new Error("Username not found in token payload");
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token Verification Error:", err);
    return res.status(403).json({ error: "Invalid token." });
  }
};

module.exports = verifyToken;
