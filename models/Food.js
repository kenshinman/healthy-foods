const mongoose = require("mongoose");
//name, description,  vendor[vendor], image, price
const FoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      unique: true
    },
    price: {
      type: String,
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profile"
    },
    image: {
      type: String
    }
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

module.exports = User = mongoose.model("food", FoodSchema);
