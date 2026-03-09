import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, useSnackbar } from "zmp-ui";
import { authService } from "@/services/authService";
import { storage } from "@/utils/storage";
import { UserProfile } from "@/types/auth";

function AccountChooserPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Parent PIN modal state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingParentProfile, setPendingParentProfile] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfiles();

      if (response.data) {
        setProfiles(response.data);
      } else {
        openSnackbar({
          text: "Không thể lấy danh sách profiles",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      openSnackbar({
        text: "Đã xảy ra lỗi khi tải profiles",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profile: UserProfile) => {
    if (profile.profileType === "Parent") {
      // Open PIN modal for parent verification
      setPendingParentProfile(profile);
      setPin("");
      setPinModalOpen(true);
      setTimeout(() => pinInputRef.current?.focus(), 100);
      return;
    }

    // Student flow
    try {
      const response = await authService.selectStudent({ profileId: profile.id });
      // Store the new access token returned by the backend (contains student context)
      if (response?.data?.accessToken) {
        await storage.setAccessToken(response.data.accessToken);
      }
      navigate("/student");
    } catch (error) {
      console.error("Error selecting student profile:", error);
      openSnackbar({
        text: "Không thể chọn profile học sinh",
        type: "error",
      });
    }
  };

  const handleVerifyParentPin = async () => {
    if (!pendingParentProfile || pin.length === 0) return;
    try {
      setPinLoading(true);
      const response = await authService.verifyParentPin({
        profileId: pendingParentProfile.id,
        pin,
      });
      if (response?.data?.success === false) {
        openSnackbar({ text: response.data.message ?? "PIN không hợp lệ", type: "error" });
        return;
      }
      setPinModalOpen(false);
      navigate("/parent");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "PIN không đúng, vui lòng thử lại";
      openSnackbar({ text: msg, type: "error" });
    } finally {
      setPinLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear any stored tokens/data
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <Page className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-slate-900">
      {/* soft blobs with animation */}
      <div 
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-300/50 blur-3xl"
        style={{
          animation: "float 6s ease-in-out infinite"
        }}
      />
      <div 
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-400/60 blur-3xl"
        style={{
          animation: "float 8s ease-in-out infinite reverse"
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Title */}
        <div 
          className="mb-10 text-center"
          style={{
            animation: "fadeInUp 0.6s ease-out"
          }}
        >
          <h1 className="text-4xl font-bold text-white">Select user</h1>
          <p className="mt-2 text-sm text-purple-100">Chọn hồ sơ để tiếp tục</p>
        </div>

        {/* Profiles */}
        {loading ? (
          <div className="mt-8 text-white">
            <p>Đang tải...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="mt-8 text-white">
            <p>Không tìm thấy profile nào</p>
          </div>
        ) : (
          <div
            className="flex gap-8 overflow-x-auto w-full px-4 pb-4"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {profiles.map((profile, index) => (
              <button
                key={profile.id}
                className="group flex flex-col items-center gap-3 transition shrink-0 pt-1"
                onClick={() => handleSelectProfile(profile)}
                type="button"
                style={{
                  scrollSnapAlign: "center",
                  animation: `scaleIn 0.5s ease-out ${index * 0.15}s both`
                }}
              >
                {/* Avatar with icon badge */}
                <div className="relative">
                  <div
                    className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${
                      profile.profileType === "Parent"
                        ? "border-4 border-yellow-400 ring-4 ring-yellow-300/50 shadow-lg shadow-yellow-400/50"
                        : "border-4 border-cyan-400 ring-4 ring-cyan-300/50 shadow-lg shadow-cyan-400/50"
                    }`}
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white">
                        <span className="text-3xl font-bold text-gray-700">
                          {profile.displayName?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Icon badge */}
                  <div
                    className={`absolute -top-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full ${
                      profile.profileType === "Parent"
                        ? "bg-yellow-500"
                        : "bg-cyan-500"
                    }`}
                  >
                    {profile.profileType === "Parent" ? (
                      <svg
                        className="h-5 w-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Name */}
                <span className="text-base font-bold text-white">
                  {profile.displayName}
                </span>

                {/* Role badge */}
                <span
                  className={`rounded-full px-4 py-1 text-xs font-semibold text-white ${
                    profile.profileType === "Parent"
                      ? "bg-yellow-500"
                      : "bg-cyan-500"
                  }`}
                >
                  {profile.profileType === "Parent" ? "Phụ huynh" : "Học sinh"}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Logout */}
        <button
          className="mt-10 flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/30 active:scale-95"
          onClick={handleLogout}
          style={{
            animation: "fadeInUp 0.8s ease-out 0.5s both"
          }}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Log out
        </button>
      </div>

      {/* Parent PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-1 text-center text-xl font-bold text-gray-800">
              Xác thực phụ huynh
            </h2>
            <p className="mb-5 text-center text-sm text-gray-500">
              Nhập PIN để đăng nhập với hồ sơ{" "}
              <span className="font-semibold text-yellow-600">
                {pendingParentProfile?.displayName}
              </span>
            </p>

            <input
              ref={pinInputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Nhập PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyParentPin()}
              className="mb-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-800 outline-none transition focus:border-yellow-400"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setPinModalOpen(false); setPin(""); }}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95"
              >
                Huỷ
              </button>
              <button
                onClick={handleVerifyParentPin}
                disabled={pin.length === 0 || pinLoading}
                className="flex-1 rounded-xl bg-yellow-500 py-3 text-sm font-semibold text-white shadow-md shadow-yellow-300/50 transition hover:bg-yellow-600 active:scale-95 disabled:opacity-50"
              >
                {pinLoading ? "Đang xác thực..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default AccountChooserPage;
