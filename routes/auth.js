const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const jwt = require("jsonwebtoken");

// to register users

router.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    // Process other form data
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // Process uploaded image
    const profilePic = req.file.path; // File path where the image is stored

    // Save the user to the database, including the profile image path
    const newUser = new User({
      username,
      email,
      password,
      profilePic, // Include the profile image path in the user object
    });

    const user = await newUser.save();

    // Respond with success message
    res.status(200).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TO LOGIN USERS

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json("Invalid Credentials!");
    }

    const validated = CryptoJS.SHA256(req.body.password).toString();
    if (validated !== user.password) {
      return res.status(400).json("Invalid Credentials!");
    }

    // Include the username in the token payload
    const accessToken = jwt.sign(
      { id: user._id, username: user.username }, // Include username here
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "4h" } // Adjusted expiration time to 4 hours
    );

    const { password, ...info } = user._doc;
    res.status(200).json({ ...info, accessToken });
  } catch (err) {
    res.status(500).json("Something went wrong");
  }
});

module.exports = router;
