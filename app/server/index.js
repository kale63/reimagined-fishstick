import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DocumentModel from "./models/document.js";
import ChatMessageModel from "./models/chatMessage.js";
import documentRoutes from "./routes/documents.js";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });
console.log('Environment variables loaded:', {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ NOT SET',
  PORT: process.env.PORT
});

const app = express();

app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: Supabase credentials not found in environment variables!");
  console.error(`SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Not set'}`);
  console.error(`SUPABASE_ANON_KEY: ${supabaseKey ? 'Set' : 'Not set'}`);
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

// Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(`Registration attempt for: ${email}`);
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  // JWT
  console.log(`Creating JWT token for userId: ${data.user.id}`);
  const token = jwt.sign({ userId: data.user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  console.log(`Token created: ${token.substring(0, 50)}...`);

  res.json({ 
    message: "User registered!", 
    token,
    user: {
      userId: data.user.id,
      email: data.user.email
    }
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  // JWT
  console.log(`Creating JWT token for userId: ${data.user.id}`);
  const token = jwt.sign({ userId: data.user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  console.log(`Token created: ${token.substring(0, 50)}...`);

  res.json({ 
    message: "Login successful!", 
    token,
    user: {
      userId: data.user.id,
      email: data.user.email
    }
  });
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

// Make models available throughout the app
app.set('DocumentModel', DocumentModel);
app.set('ChatMessageModel', ChatMessageModel);

// Import chat routes
import chatRoutes from './routes/chat.js';

// API routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('[Socket.io Auth]Token received:', token ? `${token.substring(0, 30)}...` : 'MISSING');
  console.log('[Socket.io Auth] JWT_SECRET configured:', !!process.env.JWT_SECRET);
  
  if (!token) {
    const err = new Error("Authentication error: No token provided");
    console.error('[Socket.io Auth] ERROR:', err.message);
    return next(err);
  }

  try {
    console.log('[Socket.io Auth] Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Socket.io Auth] ✅ Token verified, userId:', decoded.userId);
    socket.data.user = decoded;
    next();
  } catch (err) {
    console.error('[Socket.io Auth] ❌ Token verification failed:', err.message);
    const authErr = new Error(`Authentication error: ${err.message}`);
    next(authErr);
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join document room
  socket.on("join_document", ({ documentId }) => {
    if (!documentId) {
      console.warn('⚠️ [Server] join_document called with no documentId');
      return;
    }
    
    socket.join(`document:${documentId}`);
    console.log(`🚪 [Server] User ${socket.data.user.userId} joined room: document:${documentId}`);
    console.log(`   Room members:`, io.sockets.adapter.rooms.get(`document:${documentId}`)?.size || 0);
  });
  
  // Leave document room
  socket.on("leave_document", ({ documentId }) => {
    if (!documentId) return;
    
    socket.leave(`document:${documentId}`);
    console.log(`User ${socket.data.user.userId} left document ${documentId}`);
  });
  
  // Handle chat messages
  socket.on("chat_message", async (message) => {
    console.log('📨 [Server] Received chat_message event:', {
      from: socket.data.user?.userId,
      message: message.message.substring(0, 50),
      documentId: message.documentId
    });
    
    if (!message.documentId) {
      console.warn('⚠️ [Server] Message has no documentId');
      return;
    }
    
    // Add server timestamp
    const enrichedMessage = {
      ...message,
      serverTimestamp: new Date().toISOString()
    };
    
    try {
      // Save message to database
      await ChatMessageModel.save({
        userId: socket.data.user.userId,
        documentId: message.documentId,
        message: message.message
      });
      console.log('✅ [Server] Message saved to database');
      
      // Broadcast to everyone in the document room (including sender)
      console.log(`📤 [Server] Broadcasting to room: document:${message.documentId}`);
      io.to(`document:${message.documentId}`).emit("chat_message", enrichedMessage);
      console.log('✅ [Server] Message broadcast complete');
    } catch (error) {
      console.error("❌ [Server] Error saving chat message:", error);
      socket.emit("error", { message: "Failed to save chat message" });
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3001}`);
});
