import express from "express";
import 'dotenv/config';
import supabase from "./config/supabase.js";
import orderRoutes from "./routes/order.routes.js";
import menuRoutes from "./routes/menu.routes.js";

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
