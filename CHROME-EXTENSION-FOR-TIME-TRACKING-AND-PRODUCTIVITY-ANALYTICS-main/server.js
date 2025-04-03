const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const trackedTimeSchema = new mongoose.Schema({
    domain: String,
    timeSpent: Number
});
mongoose.connect("mongodb://localhost:27017/productivity")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

const TrackedTime = mongoose.model("TrackedTime", trackedTimeSchema, "tracked_time");

// ✅ Fix: Correct model name & incrementing timeSpent
app.post("/save", async (req, res) => {
    const { domain, timeSpent } = req.body;
    await TrackedTime.updateOne(
        { domain }, 
        { $inc: { timeSpent: timeSpent || 1 } }, 
        { upsert: true }
    );
    res.json({ success: true });
});

// ✅ Fix: Fetch stats without _id field
app.get("/stats", async (req, res) => {
    try {
        const data = await TrackedTime.find({}, { _id: 0 }); // Exclude _id
        console.log("Fetched Data:", data); // Debugging log
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: error.message });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
