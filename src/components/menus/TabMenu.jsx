import React, { useRef, useMemo } from 'react';
import useTabKeyboardNav from '../hooks/useTabKeyboardNav';

/**
 * tabs: string[] veya { label, id }[]
 */
export default function TabMenu({ tabs, activeTab, setActiveTab }) {
  const containerRef = useRef(null);

  // Stabil ref listesi (map içi useRef anti-pattern'ini kırmak için)
  const tabData = useMemo(() => {
    return tabs.map(() => ({ ref: React.createRef() }));
  }, [tabs]);

  useTabKeyboardNav(
    containerRef,
    tabData.map((t, i) => ({ ref: t.ref, value: i })),
    (i) => setActiveTab(i),
  );

  return (
    <div ref={containerRef} className="flex gap-4 mb-8" role="tablist" aria-label="Sekmeler">
      {tabs.map((tab, idx) => {
        const label = typeof tab === 'string' ? tab : tab.label;
        const panelId = `tabpanel-${idx}`;
        return (
          <button
            key={label}
            ref={tabData[idx].ref}
            className={`px-5 py-2 rounded-t font-semibold transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              activeTab === idx
                ? 'bg-yellow-400 text-gray-900 shadow'
                : 'bg-[#23263a] text-yellow-100'
            }`}
            onClick={() => setActiveTab(idx)}
            role="tab"
            aria-selected={activeTab === idx}
            aria-controls={panelId}
            tabIndex={activeTab === idx ? 0 : -1}
            data-state={activeTab === idx ? 'active' : 'inactive'}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
