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
    <form onSubmit={handleLogin} className="p-4 bg-gray-800 rounded max-w-sm mx-auto flex flex-col gap-3">
      <h2 className="text-xl font-bold text-yellow-200">Giriş Yap</h2>
      <input
        className="p-2 rounded bg-gray-700 text-yellow-50"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={e=>setUsername(e.target.value)}
        required
        autoComplete="username"
      />
      <input
        className="p-2 rounded bg-gray-700 text-yellow-50"
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <button className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded hover:bg-yellow-500 transition" type="submit" disabled={loading}>
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </form>
  );
}