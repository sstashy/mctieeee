import React, { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("https://api.sstashy.io/auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      localStorage.setItem("user", JSON.stringify({ username, token: data.token }));
      setUsername("");
      setPassword("");
      onLogin?.(data);
    } else {
      setError(data.error || "Giriş başarısız");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-6 bg-[#23263ae6] rounded-2xl p-8 relative z-20 animate-fade-in"
    >
      <h2 className="text-3xl font-extrabold text-[#5ea4ff] text-center tracking-wider mb-2 drop-shadow-lg animate-slide-down flex items-center justify-center gap-2">
      
        Giriş Yap
      </h2>
      <input
        className="px-5 py-4 rounded-xl bg-[#181c2a] text-blue-100 border border-[#334067] focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] transition-all duration-200 shadow-md placeholder:italic"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={e=>setUsername(e.target.value)}
        required
      />
      <input
        className="px-5 py-4 rounded-xl bg-[#181c2a] text-blue-100 border border-[#334067] focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] transition-all duration-200 shadow-md placeholder:italic"
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        required
      />
      <button
        className="bg-gradient-to-r from-[#5ea4ff] via-[#82cfff] to-[#5ea4ff] text-white font-bold px-6 py-3 rounded-xl shadow-xl hover:from-[#82cfff] hover:to-[#5ea4ff] hover:text-[#23263a] hover:scale-105 hover:shadow-neon transition-all duration-200 border border-[#82cfff] animate-button-pop flex items-center justify-center gap-2"
        type="submit"
        disabled={loading}
      >
        <svg className="w-5 h-5 text-white mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
      {error && <div className="text-red-400 text-md text-center font-semibold animate-error-pop">{error}</div>}
    </form>
  );
}