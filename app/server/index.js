import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "http";
import { Server } from "socket.io";
import DocumentModel from "./models/document.js";
import documentRoutes from "./routes/documents.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify exact origins
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "User registered!", data });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  // JWT
  const token = jwt.sign({ userId: data.user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ message: "Login successful!", token });
});

app.get("/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Protected data", user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Make DocumentModel available throughout the app
app.set('DocumentModel', DocumentModel);

// Document routes
app.use('/api/documents', documentRoutes);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  
  // Handle joining a document room
  socket.on('join-document', (documentId) => {
    socket.join(`document:${documentId}`);
    console.log(`User ${socket.id} joined document:${documentId}`);
  });
  
  // Handle document changes
  socket.on('document-change', (data) => {
    // Broadcast changes to all users in this document except sender
    socket.to(`document:${data.documentId}`).emit('document-updated', data);
    console.log(`Document ${data.documentId} updated by ${socket.id}`);
  });
  
  // Handle chat messages
  socket.on('send-message', (data) => {
    // Broadcast message to all users in this document
    io.to(`document:${data.documentId}`).emit('new-message', {
      id: Date.now().toString(),
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: new Date().toISOString()
    });
    console.log(`New message in document ${data.documentId} from ${data.userName}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Start server with Socket.IO
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT} with Socket.IO`)
);
