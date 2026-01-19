import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Page, Text } from "zmp-ui";

const roleOptions = [
  { value: "student", label: "Học viên" },
  { value: "parent", label: "Phụ huynh" },
  { value: "teacher", label: "Giáo viên" },
];

type Role = (typeof roleOptions)[number]["value"];

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("parent");

  const handleSubmit = () => {
    if (role === "parent") {
      navigate("/account-chooser");
      return;
    }

    if (role === "teacher") {
      navigate("/teacher");
      return;
    }

    navigate("/student");
  };

  return (
    <Page className="min-h-screen bg-slate-50">
      <Box className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10">
        <Box className="space-y-2 text-center">
          <Text.Title size="xLarge">Zalomini App</Text.Title>
          <Text className="text-sm text-slate-500">
            Đăng nhập để tiếp tục vào hệ thống học tập.
          </Text>
        </Box>

        <Box className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                placeholder="you@zalo.com"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Mật khẩu
              <input
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Chọn vai trò đăng nhập
              </p>
              <div className="grid gap-2">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2 text-sm transition ${
                      role === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200"
                    }`}
                  >
                    <span>{option.label}</span>
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={() => setRole(option.value)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <Button fullWidth onClick={handleSubmit}>
              Đăng nhập
            </Button>
          </div>
        </Box>

        <Text className="text-center text-xs text-slate-400">
          Đăng nhập phụ huynh sẽ hiển thị trang chọn tài khoản.
        </Text>
      </Box>
    </Page>
  );
}

export default LoginPage;
