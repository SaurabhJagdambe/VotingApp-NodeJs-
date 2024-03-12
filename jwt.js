const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  // Check request header has authorization or not
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Token not found" });
  //Extract the Jwt token from request headers
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ Error: "Unauthorized" });

  try {
    //Verify the JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //attach user information to the request object
    req.user = decoded;
    // req.jwtPayload = decoded
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid Token" });
  }
};

//Function to genrate the jwt token

const genrateToken = (userData) => {
  //Genrate a new JWT token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 300000 });
};

module.exports = { jwtAuthMiddleware, genrateToken };
