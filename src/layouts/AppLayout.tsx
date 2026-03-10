import { useEffect, useState } from "react";
import { App, ZMPRouter } from "zmp-ui";
import SnackbarProvider from "zmp-ui/snackbar-provider";
import type { AppProps } from "zmp-ui/app";
import MainRoutes from "@/routes";
import { getSystemInfo } from "zmp-sdk/apis";

const AppLayout = () => {
  const [theme, setTheme] = useState<AppProps["theme"]>("light");

  useEffect(() => {
    try {
      const info = getSystemInfo() as any;
      if (info?.zaloTheme) {
        setTheme(info.zaloTheme);
      }
    } catch (error) {
      console.error("getSystemInfo failed:", error);
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