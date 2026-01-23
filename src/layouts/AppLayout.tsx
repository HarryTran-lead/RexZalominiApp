import { getSystemInfo } from "zmp-sdk";
import { App, ZMPRouter } from "zmp-ui";
import SnackbarProvider from "zmp-ui/snackbar-provider";
import type { AppProps } from "zmp-ui/app";

import MainRoutes from "@/routes";

const AppLayout = () => {
  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <SnackbarProvider>
        <ZMPRouter>
          <MainRoutes />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};

export default AppLayout;
