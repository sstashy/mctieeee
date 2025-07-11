import React from "react";

export default function UserMenu({ user, onLogout }) {
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 ml-3">
      <span className="text-yellow-200 font-semibold">{user.username}</span>
      <button
        onClick={onLogout}
        className="bg-gray-700 text-yellow-200 px-2 py-1 rounded hover:bg-gray-600 transition text-sm"
      >
        Çıkış Yap
      </button>
    </div>
  );
}