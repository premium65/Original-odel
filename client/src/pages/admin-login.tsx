import { useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.login({ username, password });
      setLocation("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-[#1a2332] rounded-2xl border border-[#2a3a4d]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] to-[#eab308] rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">O</div>
          <h1 className="text-2xl font-bold text-white">OdelADS Admin</h1>
          <p className="text-[#9ca3af] mt-2">Sign in to your account</p>
        </div>
        {error && <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9ca3af] mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]" placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm text-[#9ca3af] mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#0f1419] border border-[#2a3a4d] rounded-xl text-white outline-none focus:border-[#10b981]" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
