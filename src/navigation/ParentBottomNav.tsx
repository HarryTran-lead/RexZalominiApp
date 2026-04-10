import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { Bell, House, UserRound } from "lucide-react";
import { unreadCountAtom } from "@/store/notificationStore";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const ParentBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useAtomValue(unreadCountAtom);

  const navItems: NavItem[] = [
    {
      path: "/parent",
      label: "Trang chủ",
      icon: <House className="w-6 h-6" strokeWidth={2} />,
    },
    {
      path: "/parent/notifications",
      label: "Thông báo",
      icon: <Bell className="w-6 h-6" strokeWidth={1.8} />,
    },
    {
      path: "/parent/profile",
      label: "Cá nhân",
      icon: <UserRound className="w-6 h-6" strokeWidth={2} />,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/parent") {
      return (
        location.pathname === "/parent" ||
        location.pathname === "/parent/dashboard"
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-3 pb-2"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="flex h-16 items-center justify-around rounded-2xl border border-red-100 bg-white/95 shadow-lg backdrop-blur">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex h-full flex-1 flex-col items-center justify-center transition-all ${
                active ? "text-red-600" : "text-gray-400"
              }`}
            >
              <div
                className={`relative rounded-xl p-1.5 transition-all ${
                  active ? "bg-red-50 scale-105" : "scale-100"
                }`}
              >
                {item.icon}
                {item.path === "/parent/notifications" && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`mt-0.5 text-[10px] font-medium ${active ? "font-bold" : ""}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 h-1 w-8 rounded-full bg-red-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ParentBottomNav;
