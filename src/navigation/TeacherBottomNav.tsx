import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const TeacherBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: "/teacher",
      label: "Trang chủ",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      path: "/teacher/timetable",
      label: "Lịch dạy",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      path: "/teacher/notifications",
      label: "Thông báo",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      path: "/teacher/profile",
      label: "Cá nhân",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === "/teacher") {
      return (
        location.pathname === "/teacher" ||
        location.pathname === "/teacher/dashboard"
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
                className={`rounded-xl p-1.5 transition-all ${
                  active ? "bg-red-50 scale-105" : "scale-100"
                }`}
              >
                {item.icon}
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

export default TeacherBottomNav;
