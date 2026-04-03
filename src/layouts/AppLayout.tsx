import { useEffect, useState } from "react";
import { App, ZMPRouter } from "zmp-ui";
import SnackbarProvider from "zmp-ui/snackbar-provider";
import type { AppProps } from "zmp-ui/app";
import MainRoutes from "@/routes";

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
        {/* Thêm dòng này để test */}
        <h1 style={{ position: "absolute", zIndex: 9999, top: "50px", left: "20px", color: "red", fontSize: "24px" }}>
          LAYOUT ĐÃ CHẠY! LỖI NẰM Ở ROUTER
        </h1>
        <ZMPRouter>
          <MainRoutes />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};

export default AppLayout;