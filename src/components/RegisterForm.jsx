import React, { useState } from "react";

export default function RegisterForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://api.sstashy.io/auth/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setUsername("");
        setPassword("");
        onSuccess?.();
      } else {
        setError(data.error || "Kayıt başarısız");
        console.log("API error:", data);
      }
    } catch (err) {
      setLoading(false);
      setError("Sunucuya erişilemiyor.");
      console.log("Fetch error:", err);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="bg-gradient-to-br from-[#23263a] via-[#28304a] to-[#181c2a] shadow-2xl border border-[#28304a] rounded-2xl max-w-md w-full mx-auto px-8 py-10 flex flex-col gap-5 animate-fade-in"
    >
      <h2 className="text-2xl font-bold text-[#5ea4ff] text-center drop-shadow-lg tracking-wide mb-2 animate-slide-down">Kayıt Ol</h2>
      <input
        className="px-4 py-3 rounded-lg bg-[#181c2a] text-blue-100 border border-[#334067] focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] transition-all duration-200 shadow-sm"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={e=>setUsername(e.target.value)}
        required
        autoComplete="username"
      />
      <input
        className="px-4 py-3 rounded-lg bg-[#181c2a] text-blue-100 border border-[#334067] focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] transition-all duration-200 shadow-sm"
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />
      <button
        className="bg-gradient-to-r from-[#5ea4ff] to-[#82cfff] text-white font-bold px-6 py-3 rounded-xl hover:from-[#82cfff] hover:to-[#5ea4ff] hover:scale-105 transition-all duration-200 shadow-lg"
        type="submit"
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Kayıt Ol"}
      </button>
      {error && <div className="text-red-400 text-md text-center font-semibold animate-error-pop">{error}</div>}
    </form>
  );
}