import { useEffect, useState } from "react";
import { App, ZMPRouter } from "zmp-ui"; // Lấy ZMPRouter của Zalo
import SnackbarProvider from "zmp-ui/snackbar-provider";
import type { AppProps } from "zmp-ui/app";
import MainRoutes from "@/routes";

// Import thêm BrowserRouter của React cho Web
import { BrowserRouter } from "react-router-dom";

// 1. Tạo biến nhận diện môi trường (Vercel hoặc Localhost là Web)
const isWeb = window.location.hostname.includes("vercel.app") || window.location.hostname === "localhost";

// 2. Component tự động chuyển đổi
const RouterComponent = isWeb ? BrowserRouter : ZMPRouter;

const AppLayout = () => {
  const [theme, setTheme] = useState<AppProps["theme"]>("light");

  useEffect(() => {
    try {
      const runtimeTheme = (window as any)?.zTheme;
      if (runtimeTheme === "dark" || runtimeTheme === "light") {
        setTheme(runtimeTheme);
      }
    } catch (error) {
      console.error("Detect theme failed:", error);
    }
  }, []);

  return (
    <App theme={theme}>
      <SnackbarProvider>
        {/* 3. Render Router tương ứng với môi trường */}
        <RouterComponent>
          <MainRoutes />
        </RouterComponent>
      </SnackbarProvider>
    </App>
  );
};

export default AppLayout;