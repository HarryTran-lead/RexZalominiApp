import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "zmp-ui";

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: "🏠",
      label: "Trang chủ",
    },
    {
      path: "/faq",
      icon: "❓",
      label: "FAQ",
    },
    {
      path: "/blogs",
      icon: "📰",
      label: "Bản tin",
    },
    {
      path: "/contact",
      icon: "📞",
      label: "Liên hệ",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <span
                className={`text-2xl mb-1 transition-transform ${
                  active ? "scale-110" : "scale-100"
                }`}
              >
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${active ? "font-bold" : ""}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </Box>
  );
};

export default BottomNavigation;
