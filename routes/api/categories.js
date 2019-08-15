const express = require("express");
const Category = require("../../models/Category");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const router = express.Router();

//@route          /api/categories
//desc            GET
//@access         public
router.get("/", async (req, res) => {
  try {
    const data = await Category.find();
    res.json({ success: true, data });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ msg: "Could not fetch categories now." });
  }
});

//@route          /api/categories
//desc            POST
//@access         private
router.post(
  "/",
  [
    auth,
    [
      check("name", "Name is required").exists(),
      check("slug", "Slug is required").exists()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, slug } = req.body;
    const cat = await Category.findOne({ slug });
    if (cat) return res.status(400).json({ msg: "Category already exists" });
    try {
      const newCat = new Category({ name, slug });
      await newCat.save();

      res.json(newCat);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
