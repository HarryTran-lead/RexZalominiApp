import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Page, Text } from "zmp-ui";

import logoRex from "@/app/assets/images/LogoRex.png";

const mockAccounts = {
  shared: {
    label: "Phụ huynh / Học viên",
    email: "family@rex.edu",
    password: "rex123",
    destination: "/account-chooser",
  },
  teacher: {
    label: "Giáo viên",
    email: "teacher@rex.edu",
    password: "rex123",
    destination: "/teacher",
  },
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const accounts = Object.values(mockAccounts);
    const matchedAccount = accounts.find(
      (account) =>
        account.email.toLowerCase() === normalizedEmail &&
        account.password === normalizedPassword
    );

    if (matchedAccount) {
      setErrorMessage("");
      navigate(matchedAccount.destination);
      return;
    }

    setErrorMessage("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.");
  };

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  return (
    <Page className="min-h-screen bg-gradient-to-b from-rose-100 via-white to-rose-200 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6 lg:px-6">
        {/* Top bar */}
        <header className="flex items-center justify-between rounded-full bg-white/85 px-4 py-3 shadow-sm ring-1 ring-red-100/70 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-red-100">
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

          {/* icons on mobile, text buttons on desktop */}
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-red-100 transition hover:bg-red-50 lg:h-auto lg:w-auto lg:rounded-full lg:px-4 lg:py-2 lg:text-xs lg:font-semibold"
              type="button"
              aria-label="Hỗ trợ"
            >
              <span className="lg:hidden">⋯</span>
              <span className="hidden lg:inline">Hỗ trợ</span>
            </button>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-red-100 transition hover:bg-red-50 lg:h-auto lg:w-auto lg:rounded-full lg:bg-gradient-to-r lg:from-red-600 lg:via-rose-600 lg:to-red-600 lg:px-4 lg:py-2 lg:text-xs lg:font-semibold lg:text-white"
              type="button"
              aria-label="Thoát"
            >
              <span className="lg:hidden">⏻</span>
              <span className="hidden lg:inline">Demo</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:items-stretch">
          {/* LEFT HERO: hidden on phone, show on desktop */}
          <div className="relative hidden overflow-hidden rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-red-100/70 backdrop-blur lg:block">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-200/50 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-rose-200/50 blur-3xl" />

            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Nền tảng học tập Rex
              </div>

              <Text.Title>Chào mừng bạn quay lại</Text.Title>

              <Text className="text-sm text-slate-600">
                Đăng nhập để tiếp tục theo dõi tiến độ học tập, lịch học, thông
                báo lớp và bài tập.
              </Text>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-red-100/80">
                  <p className="text-xs font-semibold text-slate-800">
                    Theo dõi tiến độ
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Báo cáo buổi học & nhận xét chi tiết.
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-red-100/80">
                  <p className="text-xs font-semibold text-slate-800">
                    Lịch học rõ ràng
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Nhắc lịch, đổi lịch (khi được phép).
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-red-100/80">
                  <p className="text-xs font-semibold text-slate-800">
                    Thông báo tức thì
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Tin nhắn từ trung tâm & giáo viên.
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-red-100/80">
                  <p className="text-xs font-semibold text-slate-800">
                    Trải nghiệm mượt
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Tối ưu cho mobile, thao tác nhanh.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: on phone -> only this card is visible */}
          <div className="flex w-full items-start justify-center lg:justify-end">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white/90 shadow-sm ring-1 ring-red-100/70 backdrop-blur">
              {/* top accent line like screenshot */}
              <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600" />

              <div className="p-6">
                {/* Logo + title (mobile look like screenshot) */}
                <div className="flex flex-col items-center gap-3 pb-4">
                  <div className="flex h-24 w-44 items-center justify-center overflow-hidden rounded-2xl bg-black/95 ring-1 ring-red-100">
                    <img
                      src={logoRex}
                      alt="Rex"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <Text.Title>Rex</Text.Title>
                  <Text className="text-sm text-slate-500">
                    Đăng nhập để tiếp tục
                  </Text>
                </div>

                <div className="space-y-4">
                  <label className="block space-y-2">
                    <Text className="text-sm font-semibold text-slate-700">
                      Email
                    </Text>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Nhập email"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </label>

                  <label className="block space-y-2">
                    <Text className="text-sm font-semibold text-slate-700">
                      Mật khẩu
                    </Text>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </label>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-slate-700">
                      <input type="checkbox" className="h-4 w-4" />
                      Ghi nhớ đăng nhập
                    </label>
                    <button className="font-semibold text-red-600" type="button">
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

                  {errorMessage ? (
                    <Text className="rounded-2xl bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-600">
                      {errorMessage}
                    </Text>
                  ) : null}

                  {/* helper note like screenshot */}
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

        {/* footer hidden on phone to keep “only login” feel */}
        <footer className="mt-6 hidden pb-2 text-center text-xs text-slate-500 lg:block">
          © {new Date().getFullYear()} Rex. All rights reserved.
        </footer>
      </div>
    </Page>
  );
}

export default LoginPage;
