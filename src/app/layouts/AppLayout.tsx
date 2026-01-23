import { getSystemInfo } from "zmp-sdk";
import { AnimationRoutes, App, Route, ZMPRouter } from "zmp-ui";
import SnackbarProvider from "zmp-ui/snackbar-provider";
import type { AppProps } from "zmp-ui/app";

import AccountChooserPage from "@/features/auth/pages/AccountChooserPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ParentPage from "@/features/roles/parent/pages/ParentPage";
import StudentPage from "@/features/roles/student/pages/StudentPage";
import TeacherPage from "@/features/roles/teacher/pages/TeacherPage";

const AppLayout = () => {
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

export default AppLayout;
