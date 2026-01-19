import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Page, Text } from "zmp-ui";

import logoRex from "@/static/Logo-Tea-Rex.png";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    const isTeacher = email.toLowerCase().includes("teacher");
    if (isTeacher) navigate("/teacher");
    else navigate("/account-chooser");
  };

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  return (
    <Page className="min-h-screen bg-gradient-to-br from-red-100 via-white to-rose-200 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 lg:px-6">
        {/* Header */}
        <header className="flex items-center justify-between rounded-full bg-white/85 px-5 py-3 shadow-sm ring-1 ring-red-100/70 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Header logo: đổi sang dạng badge nhỏ, không bị lọt */}
            <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-red-100">
              <img
                src={logoRex}
                alt="Rex"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="leading-tight">
              <Text.Title size="small">Rex</Text.Title>
              <Text className="text-xs text-slate-500">
                Learn better, grow faster
              </Text>
            </div>
          </div>

          <button className="rounded-full border border-red-200/70 bg-white px-3 py-1 text-xs font-semibold text-red-600">
            VI
          </button>
        </header>

        {/* Main */}
        <div className="grid overflow-hidden rounded-[32px] bg-white shadow-xl ring-1 ring-red-100/60 lg:grid-cols-[1.1fr_1fr]">
          {/* LEFT PANEL – desktop only */}
          <div className="hidden lg:flex flex-col gap-6 bg-gradient-to-br from-red-700 via-rose-600 to-red-500 px-10 py-12 text-white">
            <div className="space-y-2">
              <Text.Title size="xLarge">Đăng nhập Rex</Text.Title>
              <Text className="text-sm text-white/85">
                Phụ huynh &amp; học viên dùng chung tài khoản để chọn hồ sơ sau
                khi đăng nhập. Giáo viên vào thẳng trang giáo viên.
              </Text>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Theo dõi tiến độ",
                  description: "Cập nhật lịch học và kết quả theo thời gian thực",
                },
                {
                  title: "Quản lý nhiều hồ sơ",
                  description: "Một tài khoản có thể quản lý nhiều học viên",
                },
                {
                  title: "Kết nối giáo viên",
                  description: "Trao đổi nhanh, nắm tình hình học tập",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 px-4 py-3"
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-white/75">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 text-xs text-white/70">
              <div className="space-y-1">
                <p>Trang chủ</p>
                <p>Khoá học</p>
                <p>Liên hệ</p>
              </div>
              <div className="space-y-1">
                <p>Chính sách</p>
                <p>Câu hỏi thường gặp</p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative flex flex-col gap-6 px-6 pb-12 pt-10 sm:px-8 lg:justify-center lg:py-12">
            {/* Red glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-10 left-10 h-40 w-40 rounded-full bg-red-200/40 blur-3xl" />
              <div className="absolute bottom-10 right-8 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl" />
            </div>

            {/* Push down a bit on mobile */}
            <div className="relative mx-auto w-full max-w-sm pt-8">
              {/* Logo dạng banner cho đẹp, không bị nhỏ */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 w-44 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-red-100">
                  <img
                    src={logoRex}
                    alt="Rex"
                    className="h-18 w-full object-cover"
                  />
                </div>

                <Text.Title size="large">Anh Ngữ Rex</Text.Title>
                <Text className="text-sm text-slate-500">
                  Đăng nhập để tiếp tục
                </Text>
              </div>

              {/* Card */}
              <div className="overflow-hidden rounded-[28px] border border-red-100/80 bg-white shadow-sm">
                {/* Accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                <div className="space-y-4 p-6">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">
                      Email
                    </span>
                    <input
                      type="email"
                      placeholder="Nhập email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">
                      Mật khẩu
                    </span>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </label>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" className="h-4 w-4" />
                      Ghi nhớ đăng nhập
                    </label>
                    <button className="font-semibold text-red-600">
                      Quên mật khẩu?
                    </button>
                  </div>

                  <Button
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white disabled:opacity-50"
                  >
                    Đăng nhập
                  </Button>

                  <Text className="pt-2 text-center text-xs text-slate-500">
                    Phụ huynh &amp; học viên sẽ chọn hồ sơ sau khi đăng nhập.
                    <span className="font-semibold text-red-600">
                      {" "}
                      Giáo viên vào thẳng trang giáo viên.
                    </span>
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2" />
      </div>
    </Page>
  );
}

export default LoginPage;
