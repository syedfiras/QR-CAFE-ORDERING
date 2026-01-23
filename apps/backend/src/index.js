import express from "express";
import 'dotenv/config';
import supabase from "./config/supabase.js";
import orderRoutes from "./routes/order.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders/metrics", metricsRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes); 

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
});
