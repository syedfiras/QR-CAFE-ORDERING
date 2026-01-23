import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (!adminUsername || !adminPassword) {
      console.error("ADMIN_USERNAME or ADMIN_PASSWORD/ADMIN_PASSWORD_HASH not set in .env");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Compare username and password directly (trimmed)
    if (username.trim() !== adminUsername.trim() || password.trim() !== adminPassword.trim()) {
      return res.status(401).json({ error: "Invalid credentials" });
    }



    // Sign Token
    const jwtSecret = process.env.JWT_SECRET || "default_secret_please_change";
    const token = jwt.sign({ role: "admin", user: username }, jwtSecret, {
      expiresIn: "7d", // Session lasts 7 days unless cleared
    });

    // Set HTTP-Only Cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: true, // Required for sameSite: 'none'
      sameSite: "none", // Allow cross-domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = (req, res) => {
  const token = req.cookies.admin_token;
  const jwtSecret = process.env.JWT_SECRET || "default_secret_please_change";

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    jwt.verify(token, jwtSecret);
    res.json({ authenticated: true });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
};
