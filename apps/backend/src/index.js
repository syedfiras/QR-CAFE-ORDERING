import express from "express";
import 'dotenv/config';
import supabase from "./config/supabase.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
