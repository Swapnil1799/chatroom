const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Import send-message API
const sendMessageRoute = require("./api/send-message");
app.use("/send-message", sendMessageRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
