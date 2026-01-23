"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginAdmin } from "../../services/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginAdmin(username, password);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-primary-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-elegant p-8 border-2 border-primary-100">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-soft overflow-hidden mb-4 border-2 border-primary-50">
            <Image
              src="/images/Bistro Yahya.png"
              alt="Logo"
              fill
              className="object-contain p-2"
            />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800">Admin Portal</h1>
          <p className="text-neutral-500 text-sm font-medium mt-1">Bistro Yahya</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium text-neutral-800"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium text-neutral-800"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary-600 text-white font-bold text-lg shadow-soft-lg hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-400 font-medium">
          Protected System • Authorized Access Only
        </p>
      </div>
    </div>
  );
}
