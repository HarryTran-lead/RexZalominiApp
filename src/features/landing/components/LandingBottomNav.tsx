import type { LandingTab } from "../LandingPage";

// SVG icons for each tab
const Icons = {
  home: (active: boolean) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? "#DC2626" : "none"} stroke={active ? "#DC2626" : "#94A3B8"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  faq: (active: boolean) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={active ? "#DC2626" : "#94A3B8"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={3} />
    </svg>
  ),
  news: (active: boolean) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={active ? "#DC2626" : "#94A3B8"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
  ),
  contact: (_active: boolean) => (
    // Zalo logo-inspired chat bubble icon
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
    </svg>
  ),
};

const TABS: Array<{ key: LandingTab; label: string }> = [
  { key: "home", label: "Trang chủ" },
  { key: "faq", label: "FAQ" },
  { key: "news", label: "Bản tin" },
  { key: "contact", label: "Liên hệ" },
];

interface LandingBottomNavProps {
  activeTab: LandingTab;
  onTabChange: (tab: LandingTab) => void;
  onContactPress: () => void;
}

function LandingBottomNav({ activeTab, onTabChange, onContactPress }: LandingBottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-3"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
    >
      <div className="flex h-[60px] items-stretch overflow-hidden rounded-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.10)] border border-slate-100">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const isContact = tab.key === "contact";

          if (isContact) {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={onContactPress}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-red-600 active:bg-red-700 transition-colors"
                aria-label="Liên hệ qua Zalo OA"
              >
                {Icons.contact(false)}
                <span className="text-[10px] font-bold text-white">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors active:bg-slate-50"
              aria-label={tab.label}
            >
              {Icons[tab.key](isActive)}
              <span
                className={`text-[10px] font-bold transition-colors ${
                  isActive ? "text-red-600" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1.5 h-[3px] w-6 rounded-full bg-red-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LandingBottomNav;
