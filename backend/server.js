const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 🔥 正确连接你的数据库 vinylogs
mongoose.connect(
  "mongodb+srv://xuzhen:520Xuzhenfei@cluster0.h87rqm6.mongodb.net/vinylogs?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB Connected to vinylogs"))
.catch(err => console.log("MongoDB ERROR: ", err));


// Schema
const VinylSchema = new mongoose.Schema({
  title: String,
  artist: String,
  year: Number,
  genre: String,
  coverImage: String
});

const Vinyl = mongoose.model("Vinyl", VinylSchema);

// Get all vinyls
app.get("/vinyls", async (req, res) => {
  const vinyls = await Vinyl.find();
  res.json(vinyls);
});

// Add vinyl
app.post("/vinyls", async (req, res) => {
  const newVinyl = await Vinyl.create(req.body);
  res.json(newVinyl);
});

// Update vinyl
app.put("/vinyls/:id", async (req, res) => {
  const updated = await Vinyl.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// Delete vinyl
app.delete("/vinyls/:id", async (req, res) => {
  await Vinyl.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
