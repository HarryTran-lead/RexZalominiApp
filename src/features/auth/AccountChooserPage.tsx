import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, useSnackbar } from "zmp-ui";
import { authService } from "@/services/authService";
import { storage } from "@/utils/storage";
import { UserProfile } from "@/types/auth";
import { firstResolvedAssetUrl } from "@/utils/assetUrl";

const MAX_PARENT_PIN_ATTEMPTS = 3;

type PinResetStep = "none" | "otp" | "new-pin";

function avatarUrl(profile: UserProfile): string {
  const record = profile as UserProfile & Record<string, unknown>;
  return firstResolvedAssetUrl(
    profile.avatarUrl,
    typeof record.avatar === "string" ? record.avatar : undefined,
    typeof record.imageUrl === "string" ? record.imageUrl : undefined
  );
}

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
  const [pinFailedAttempts, setPinFailedAttempts] = useState(0);
  const [requestingPinResetOtp, setRequestingPinResetOtp] = useState(false);
  const [pinResetStep, setPinResetStep] = useState<PinResetStep>("none");
  const [pinResetChallengeId, setPinResetChallengeId] = useState("");
  const [pinResetOtp, setPinResetOtp] = useState("");
  const [verifyingPinResetOtp, setVerifyingPinResetOtp] = useState(false);
  const [pinResetToken, setPinResetToken] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [resettingPin, setResettingPin] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const isCompactProfiles = profiles.length <= 2;

  const resetPinFlowState = () => {
    setRequestingPinResetOtp(false);
    setPinResetStep("none");
    setPinResetChallengeId("");
    setPinResetOtp("");
    setVerifyingPinResetOtp(false);
    setPinResetToken("");
    setNewPin("");
    setConfirmNewPin("");
    setResettingPin(false);
  };

  const closePinModal = () => {
    setPinModalOpen(false);
    setPendingParentProfile(null);
    setPin("");
    setPinLoading(false);
    setPinFailedAttempts(0);
    resetPinFlowState();
  };

  const extractChallengeId = (value: unknown): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;

    if (typeof value === "object") {
      const payload = value as Record<string, unknown>;
      const challengeId =
        payload.challengeId ??
        payload.challengeID ??
        payload.id;

      if (typeof challengeId === "string" && challengeId.trim()) {
        return challengeId;
      }

      if (payload.data) {
        return extractChallengeId(payload.data);
      }
    }

    return null;
  };

  const extractPinResetToken = (value: unknown): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;

    if (typeof value === "object") {
      const payload = value as Record<string, unknown>;
      const token =
        payload.token ??
        payload.resetToken ??
        payload.pinResetToken;

      if (typeof token === "string" && token.trim()) {
        return token;
      }

      if (payload.data) {
        return extractPinResetToken(payload.data);
      }
    }

    return null;
  };

  const handleParentPinFailure = (message?: string) => {
    const nextAttempts = pinFailedAttempts + 1;
    setPinFailedAttempts(nextAttempts);

    if (nextAttempts >= MAX_PARENT_PIN_ATTEMPTS) {
      openSnackbar({
        text: "Bạn đã nhập sai PIN 3 lần. Vui lòng xác thực OTP Zalo để đặt lại PIN.",
        type: "warning",
      });
    } else {
      const remainingAttempts = MAX_PARENT_PIN_ATTEMPTS - nextAttempts;
      openSnackbar({
        text: `${message ?? "PIN không đúng"}. Còn ${remainingAttempts} lần thử.`,
        type: "error",
      });
    }

    setPin("");
    setTimeout(() => pinInputRef.current?.focus(), 100);
  };

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
      setPinFailedAttempts(0);
      resetPinFlowState();
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

  const handleVerifyParentPin = async (pinCode?: string) => {
    const pinToVerify = pinCode ?? pin;
    if (!pendingParentProfile || pinToVerify.length !== 4 || pinLoading) return;

    try {
      setPinLoading(true);
      const response = await authService.verifyParentPin({
        profileId: pendingParentProfile.id,
        pin: pinToVerify,
      });

      if (response?.data?.success === false) {
        handleParentPinFailure(response.data.message ?? "PIN không hợp lệ");
        return;
      }

      setPinFailedAttempts(0);
      resetPinFlowState();
      setPinModalOpen(false);
      navigate("/parent");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "PIN không đúng, vui lòng thử lại";
      handleParentPinFailure(msg);
    } finally {
      setPinLoading(false);
    }
  };

  const handleRequestPinResetZaloOtp = async () => {
    if (requestingPinResetOtp) return;

    try {
      setRequestingPinResetOtp(true);
      const response = await authService.requestPinResetZaloOtp();

      const challengeId = extractChallengeId(response?.data) ?? extractChallengeId(response);
      if (!challengeId) {
        throw new Error("Không nhận được challengeId từ hệ thống. Vui lòng thử lại.");
      }

      setPinResetChallengeId(challengeId);
      setPinResetOtp("");
      setPinResetStep("otp");
      openSnackbar({
        text: "Đã gửi OTP Zalo. Vui lòng nhập mã OTP để xác thực.",
        type: "success",
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        "Không thể gửi OTP đặt lại PIN.";
      openSnackbar({ text: msg, type: "error" });
    } finally {
      setRequestingPinResetOtp(false);
    }
  };

  const handleVerifyPinResetZaloOtp = async () => {
    if (!pinResetChallengeId || verifyingPinResetOtp) return;

    const otp = pinResetOtp.trim();
    if (otp.length < 4) {
      openSnackbar({ text: "Vui lòng nhập OTP hợp lệ.", type: "warning" });
      return;
    }

    try {
      setVerifyingPinResetOtp(true);
      const response = await authService.verifyPinResetZaloOtp({
        challengeId: pinResetChallengeId,
        otp,
      });

      const token = extractPinResetToken(response?.data) ?? extractPinResetToken(response);
      if (!token) {
        throw new Error("Không nhận được token đặt lại PIN. Vui lòng thử lại.");
      }

      setPinResetToken(token);
      setPinResetStep("new-pin");
      openSnackbar({ text: "Xác thực OTP thành công. Hãy nhập PIN mới.", type: "success" });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        "OTP không hợp lệ hoặc đã hết hạn.";
      openSnackbar({ text: msg, type: "error" });
    } finally {
      setVerifyingPinResetOtp(false);
    }
  };

  const handleResetPin = async () => {
    if (!pinResetToken || resettingPin) return;

    const normalizedNewPin = newPin.replace(/\D/g, "").slice(0, 4);
    const normalizedConfirmPin = confirmNewPin.replace(/\D/g, "").slice(0, 4);

    if (normalizedNewPin.length !== 4 || normalizedConfirmPin.length !== 4) {
      openSnackbar({ text: "PIN mới phải đủ 4 chữ số.", type: "warning" });
      return;
    }

    if (normalizedNewPin !== normalizedConfirmPin) {
      openSnackbar({ text: "Xác nhận PIN chưa khớp.", type: "warning" });
      return;
    }

    try {
      setResettingPin(true);
      await authService.resetPin({
        token: pinResetToken,
        newPin: normalizedNewPin,
      });

      setPinFailedAttempts(0);
      setPinResetStep("none");
      setPinResetChallengeId("");
      setPinResetOtp("");
      setPinResetToken("");
      setNewPin("");
      setConfirmNewPin("");
      setPin("");

      openSnackbar({
        text: "Đặt lại PIN thành công. Vui lòng nhập PIN mới để tiếp tục.",
        type: "success",
      });
      setTimeout(() => pinInputRef.current?.focus(), 100);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        "Không thể đặt lại PIN.";
      openSnackbar({ text: msg, type: "error" });
    } finally {
      setResettingPin(false);
    }
  };

  const handleLogout = () => {
    // Clear any stored tokens/data
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <Page className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-slate-900">
      {/* soft blobs with animation */}
      <div 
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-300/50 blur-3xl"
        style={{
          animation: "float 6s ease-in-out infinite"
        }}
      />
      <div 
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-red-400/60 blur-3xl"
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
            className={`flex w-full pb-4 ${
              isCompactProfiles
                ? "justify-center gap-8 px-2"
                : "gap-8 overflow-x-auto px-4"
            }`}
            style={{
              scrollSnapType: isCompactProfiles ? undefined : "x mandatory",
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {profiles.map((profile, index) => {
              const resolvedAvatar = avatarUrl(profile);
              return (
              <button
                key={profile.id}
                className="group flex w-[146px] shrink-0 flex-col items-center gap-3 pt-1 transition"
                onClick={() => handleSelectProfile(profile)}
                type="button"
                style={{
                  scrollSnapAlign: isCompactProfiles ? undefined : "center",
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
                    {resolvedAvatar ? (
                      <img
                        src={resolvedAvatar}
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
              );
            })}
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
              <span className="font-semibold text-red-600">
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
              disabled={pinLoading}
              onChange={(e) => {
                const nextPin = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(nextPin);
                if (nextPin.length === 4) {
                  void handleVerifyParentPin(nextPin);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyParentPin()}
              className="mb-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-800 outline-none transition focus:border-red-400"
            />

            {pinFailedAttempts > 0 && pinFailedAttempts < MAX_PARENT_PIN_ATTEMPTS && (
              <p className="mb-4 text-center text-xs font-medium text-orange-600">
                Bạn còn {MAX_PARENT_PIN_ATTEMPTS - pinFailedAttempts} lần nhập PIN.
              </p>
            )}

            {pinFailedAttempts >= MAX_PARENT_PIN_ATTEMPTS && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="mb-3 text-xs font-medium text-red-700">
                  Quên PIN hoặc cần đổi PIN? Xác thực OTP Zalo để đặt lại.
                </p>

                {pinResetStep === "none" && (
                  <button
                    type="button"
                    onClick={() => {
                      void handleRequestPinResetZaloOtp();
                    }}
                    disabled={requestingPinResetOtp}
                    className="w-full rounded-lg bg-[#BB0000] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {requestingPinResetOtp ? "Đang gửi OTP..." : "Nhận OTP Zalo"}
                  </button>
                )}

                {pinResetStep === "otp" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="Nhập OTP"
                      value={pinResetOtp}
                      onChange={(e) => setPinResetOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-center text-sm font-semibold tracking-[0.2em] text-gray-800 outline-none focus:border-red-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void handleRequestPinResetZaloOtp();
                        }}
                        disabled={requestingPinResetOtp}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                      >
                        Gửi lại OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleVerifyPinResetZaloOtp();
                        }}
                        disabled={verifyingPinResetOtp || pinResetOtp.trim().length < 4}
                        className="rounded-lg bg-[#BB0000] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {verifyingPinResetOtp ? "Đang xác thực..." : "Xác thực OTP"}
                      </button>
                    </div>
                  </div>
                )}

                {pinResetStep === "new-pin" && (
                  <div className="space-y-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="PIN mới (4 số)"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-center text-sm font-semibold tracking-[0.3em] text-gray-800 outline-none focus:border-red-400"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Xác nhận PIN mới"
                      value={confirmNewPin}
                      onChange={(e) =>
                        setConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-center text-sm font-semibold tracking-[0.3em] text-gray-800 outline-none focus:border-red-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void handleResetPin();
                      }}
                      disabled={
                        resettingPin ||
                        newPin.length !== 4 ||
                        confirmNewPin.length !== 4
                      }
                      className="w-full rounded-lg bg-[#BB0000] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {resettingPin ? "Đang đặt lại..." : "Đặt lại PIN"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closePinModal}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  void handleVerifyParentPin();
                }}
                disabled={pin.length !== 4 || pinLoading}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-md shadow-red-300/50 transition hover:bg-red-600 active:scale-95 disabled:opacity-50"
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
