const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const app = express();
//connect db
connectDB();

app.use(morgan("combined"));
app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 3500;

app.get("/", (req, res) => {
  res.send("welcome");
});

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/categories", require("./routes/api/categories"));

app.listen(PORT, function() {
  console.log(`server running on ${PORT}`);
});
