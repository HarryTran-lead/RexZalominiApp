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
        <ZMPRouter>
          <MainRoutes />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};

export default AppLayout;