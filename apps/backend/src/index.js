import express from "express";
import 'dotenv/config';
import supabase from "./config/supabase.js";
import orderRoutes from "./routes/order.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import cors from "cors";
const app = express();

// CORS Configuration
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders/metrics", metricsRoutes);
app.use("/api/sessions", sessionRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});
