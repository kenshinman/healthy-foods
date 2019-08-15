const express = require("express");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const gravatar = require("gravatar");

const router = express.Router();

//@route      GET api/auth
//@desc       test route
//@access     Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server error");
  }
});

//@route      GET api/auth/login
//@desc       Authenticate user and get token
//@access     Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      const { email, password } = req.body;

      try {
        let user = await User.findOne({ email });
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const isMatch = bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const payload = {
          user: {
            id: user.id
          }
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            user.password = undefined;
            res.json({ success: true, data: user, token });
          }
        );
      } catch (error) {
        // console.log(error.message);
      }
    }
  }
);

//@route      GET api/auth/login
//@desc       Authenticate user and get token
//@access     Public (name, email, password, phone)
router.post(
  "/register",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Email is required")
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email address").isEmail(),
    check("password", "Password is requiree")
      .not()
      .isEmpty(),
    check("password", "Password should at least 5 chagacters").isLength({
      min: 5
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //if the errors array is not empty then return array
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    //desctructure request
    const { name, password, email, phone, location } = req.body;

    //check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists" });
    }

    try {
      const user = new User({ name, password, email, phone, location });
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      const payload = { user: { id: user.id } };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          user.password = undefined;
          res.json({ success: true, data: user, token });
        }
      );
      // res.json({ success: true, data: user, token });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ success: false, msg: "Bad request" });
    }
  }
);

module.exports = router;
