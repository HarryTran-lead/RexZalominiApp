import { useNavigate } from "react-router-dom";
import { Button, Page, Text } from "zmp-ui";

const profiles = [
  { name: "Nhật", role: "student", accent: false },
  { name: "Thịnh", role: "student", accent: false },
  { name: "Anh", role: "student", accent: false },
  { name: "Bố Khương", role: "parent", accent: true, initial: "B" },
];

function AccountChooserPage() {
  const navigate = useNavigate();

  return (
    <Page className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-100 via-white to-rose-200 text-slate-900">
      {/* soft blobs like login */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl" />

      {/* Top avatar */}
      <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-red-100/80 backdrop-blur">
        N
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Title */}
        <div className="text-center">
          <Text.Title>Select user</Text.Title>
          <Text className="mt-1 text-sm text-slate-600">
            Chọn hồ sơ để tiếp tục
          </Text>
        </div>

        {/* Profiles */}
        <div className="mt-8 w-full max-w-md rounded-3xl bg-white/85 p-6 shadow-sm ring-1 ring-red-100/70 backdrop-blur">
          <div className="grid grid-cols-2 gap-5">
            {profiles.map((profile) => (
              <button
                key={profile.name}
                className="group flex flex-col items-center gap-3 rounded-2xl p-3 transition hover:bg-red-50/70"
                onClick={() =>
                  navigate(profile.role === "parent" ? "/parent" : "/student")
                }
                type="button"
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full border transition group-hover:scale-105 ${
                    profile.accent
                      ? "border-red-200 bg-white text-slate-700 shadow-sm ring-4 ring-red-100/70"
                      : "border-red-100 bg-white/70 text-slate-700"
                  }`}
                >
                  <span className="text-xl font-semibold">
                    {profile.initial ?? profile.name?.[0] ?? ""}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {profile.name}
                </span>

                <span className="text-[11px] text-slate-500">
                  {profile.role === "parent" ? "Phụ huynh" : "Học viên"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <Button
          className="mt-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 px-6 text-sm font-semibold text-white"
          onClick={() => navigate("/")}
        >
          Log out
        </Button>
      </div>
    </Page>
  );
}

export default AccountChooserPage;
