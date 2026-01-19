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
    <Page className="relative min-h-screen overflow-hidden bg-gradient-to-br from-fuchsia-600 via-purple-500 to-blue-500">
      {/* Avatar góc trên */}
      <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white">
        N
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-white">
        <div className="text-center">
          <Text.Title size="xLarge">Select user</Text.Title>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
          {profiles.map((profile) => (
            <button
              key={profile.name}
              className="group flex flex-col items-center gap-3"
              onClick={() =>
                navigate(
                  profile.role === "parent" ? "/parent" : "/student"
                )
              }
            >
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/80 transition group-hover:scale-105 ${
                  profile.accent
                    ? "bg-white text-slate-700 shadow-lg"
                    : "bg-white/10"
                }`}
              >
                <span className="text-xl font-semibold">
                  {profile.initial ?? ""}
                </span>
              </div>
              <span className="text-sm font-medium">{profile.name}</span>
            </button>
          ))}
        </div>

        <Button
          className="mt-12 rounded-xl bg-white/90 px-6 text-sm font-semibold text-slate-700"
          onClick={() => navigate("/")}
        >
          Log out
        </Button>
      </div>
    </Page>
  );
}

export default AccountChooserPage;
