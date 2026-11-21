const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../Models/userModel"); 

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body; // Mund ta heqësh 'role' nga këtu që të mos rrezikosh
  try {
    if (!username || !email || !password)
      return res.status(400).json({ message: "complete all the fields" });

    const foundUser = await User.findOne({ email });
    if (foundUser)
      return res.status(400).json({ message: "User with this email already exists!" });

    const assignedRole = (email === "admin@house.com") ? "admin" : "user";

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user || !user.password) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { 
      httpOnly: true,
      secure: false,
      sameSite: 'lax' 
    }).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, 
    sameSite: 'lax',
    path: "/" 
  }).json({ message: "Logged out successfully" });
});

module.exports = router;