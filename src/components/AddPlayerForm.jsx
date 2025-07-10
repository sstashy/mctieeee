// import React, { useState } from "react";

// export default function AddPlayerForm() {
//   const [mode, setMode] = useState("NethOP");
//   const [tier, setTier] = useState("Tier 1");
//   const [name, setName] = useState("");
//   const [tierType, setTierType] = useState("HT");
//   const [lastTested, setLastTested] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const player = { name, tierType, lastTested };
//     const res = await fetch("http://localhost:3030/api/add-player", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ mode, tier, player }),
//     });
//     if (res.ok) alert("Oyuncu eklendi!");
//     else alert("Hata!");
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input value={name} onChange={e => setName(e.target.value)} placeholder="İsim" required />
//       <select value={tierType} onChange={e => setTierType(e.target.value)}>
//         <option value="HT">HT</option>
//         <option value="LT">LT</option>
//       </select>
//       <input value={lastTested} onChange={e => setLastTested(e.target.value)} placeholder="Test Tarihi" required />
//       <button type="submit">Ekle</button>
//     </form>
//   );
// }