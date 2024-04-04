const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "Somnathdubeyisgoodboy";

console.log("helloji");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json(users); // Send the users as JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//signup

router.post(
  "/signup",
  [
    body("first_name").isLength({ min: 3 }),
    body("last_name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password", "Password length must be at least 5 characters").isLength({
      min: 5,
    }),
    body("gender").isString(),
    body("avatar").isString(),
    body("domain").isString(),
    body("available").isBoolean(),
  ],
  async (req, res) => {
    let success = false;
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      // Validate request body
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }

      // Check if user already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashedPassword,
        gender: req.body.gender,
        avatar: req.body.avatar,
        domain: req.body.domain,
        available: req.body.available,
      });

      await user.save();

      // Create JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(payload, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route: POST "/api/auth/signin" (No authentication required)
router.post(
  "/signin",
  [body("email").isEmail(), body("password", "Password is required").exists()],
  async (req, res) => {
    let success = false;
    //Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Validate request body
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }

      // Check if user exists
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Validate password
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Create JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(payload, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route: PUT "/api/auth/:id" (Authentication required)
router.put("/update/:id", fetchuser, async (req, res) => {
  try {
    const userId = req.params.id;
    const { first_name, last_name, email, gender, avatar, domain, available } = req.body;

    // Check if the requesting user is the owner of the profile
    if (req.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user data
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.gender = gender;
    user.avatar = avatar;
    user.domain = domain;
    user.available = available;

    // Save the updated user
    await user.save();

    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route: DELETE "/api/users/:id" (Authentication required)
router.delete("/delete/:id", fetchuser, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the requesting user is the owner of the profile
    if (req.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await user.remove();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


// Route: GET "/api/auth/getuser" (No authentication required)
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
