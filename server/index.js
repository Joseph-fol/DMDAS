const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/user.route");
const { checkInternetConnection } = require("./middleware/network");

require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const URI = process.env.MONGO_URI;

const dns = require("node:dns");
const port = process.env.PORT;

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

mongoose.connect(URI)
  .then(() => {
    console.log("Connected to MONGODB");
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to mongoDB", error);
    console.log("Server did not start due to MongoDB connection failure.");
  });

app.use("/api", checkInternetConnection, userRoute);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});
