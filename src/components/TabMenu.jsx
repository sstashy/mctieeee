import React from "react";

export default function TabMenu({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex gap-4 mb-8">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          className={`px-5 py-2 rounded-t font-semibold transition tab-${activeTab === idx ? "active" : "inactive"} focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          onClick={() => setActiveTab(idx)}
          tabIndex={0}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}