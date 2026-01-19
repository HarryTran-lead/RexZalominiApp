import { useNavigate } from "react-router-dom";
import { Box, Button, Page, Text } from "zmp-ui";

function AccountChooserPage() {
  const navigate = useNavigate();

  return (
    <Page className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Box className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-10">
        <div className="text-center">
          <Text.Title size="xLarge">Chọn tài khoản</Text.Title>
          <Text className="text-sm text-slate-500">
            Phụ huynh chọn chế độ để tiếp tục vào hệ thống.
          </Text>
        </div>

        <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-slate-200 p-4">
            <Text.Title size="small">Chế độ học viên</Text.Title>
            <Text className="text-sm text-slate-500">
              Theo dõi lịch học, nhiệm vụ và thông báo học vụ.
            </Text>
            <Button
              fullWidth
              className="mt-4"
              onClick={() => navigate("/student")}
            >
              Vào giao diện học viên
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <Text.Title size="small">Chế độ phụ huynh</Text.Title>
            <Text className="text-sm text-slate-500">
              Quản lý tài khoản, học phí và báo cáo học tập.
            </Text>
            <Button
              fullWidth
              variant="secondary"
              className="mt-4"
              onClick={() => navigate("/parent")}
            >
              Vào giao diện phụ huynh
            </Button>
          </div>
        </div>

        <Button variant="tertiary" onClick={() => navigate("/")}>
          Quay lại đăng nhập
        </Button>
      </Box>
    </Page>
  );
}

export default AccountChooserPage;