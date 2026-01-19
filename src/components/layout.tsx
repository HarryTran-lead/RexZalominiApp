import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  SnackbarProvider,
  ZMPRouter,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";

import AccountChooserPage from "@/pages/account-chooser";
import LoginPage from "@/pages/index";
import ParentPage from "@/pages/parent";
import StudentPage from "@/pages/student";
import TeacherPage from "@/pages/teacher";

const Layout = () => {
  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/account-chooser" element={<AccountChooserPage />} />
            <Route path="/student" element={<StudentPage />} />
            <Route path="/parent" element={<ParentPage />} />
            <Route path="/teacher" element={<TeacherPage />} />
          </AnimationRoutes>
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};

export default Layout;
