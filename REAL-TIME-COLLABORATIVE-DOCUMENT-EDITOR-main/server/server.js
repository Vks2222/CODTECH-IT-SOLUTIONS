const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/collaborative-editor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Document Schema
const documentSchema = new mongoose.Schema({
  _id: String, // Document ID
  content: String, // Document Content
});

const Document = mongoose.model("Document", documentSchema);

const PORT = process.env.PORT || 5000;

// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-document", async (docId) => {
    socket.join(docId);

    try {
      let document = await Document.findById(docId);
      if (!document) {
        document = await Document.create({ _id: docId, content: "" });
      }
      socket.emit("load-document", document.content);
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  });

  socket.on("send-changes", async (docId, content) => {
    socket.to(docId).emit("receive-changes", content);
    try {
      await Document.findByIdAndUpdate(docId, { content });
    } catch (error) {
      console.error("Error saving document:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
