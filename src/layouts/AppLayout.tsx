import { useEffect, useState } from "react";
import { App } from "zmp-ui"; // Đã bỏ ZMPRouter ở đây
import SnackbarProvider from "zmp-ui/snackbar-provider";
import type { AppProps } from "zmp-ui/app";
import MainRoutes from "@/routes";
import { BrowserRouter } from "react-router-dom";

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
        {/* THAY ZMPRouter THÀNH BrowserRouter */}
        <BrowserRouter>
          <MainRoutes />
        </BrowserRouter>
      </SnackbarProvider>
    </App>
  );
};

export default AppLayout;