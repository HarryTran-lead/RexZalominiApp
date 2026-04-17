import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Spinner, useSnackbar } from "zmp-ui";
import ConfirmModal from "@/components/common/ConfirmModal";
import ProfileAccordionItem from "@/components/profile/ProfileAccordionItem";
import ProfileAccountSection from "@/components/profile/ProfileAccountSection";
import ProfileHeroCard from "@/components/profile/ProfileHeroCard";
import ProfileInfoSection from "@/components/profile/ProfileInfoSection";
import ProfileSecuritySection from "@/components/profile/ProfileSecuritySection";
import { CircleUserRound, FileText, Info, Lock, LogOut, RotateCw, Users } from "lucide-react";
import { API_CONFIG } from "@/constants/apiURL";
import { authService } from "@/services/authService";
import { fileService } from "@/services/fileService";
import { meService } from "@/services/meService";
import { firstResolvedAssetUrl } from "@/utils/assetUrl";
import { storage } from "@/utils/storage";
import { UpdateProfileDisplayNameItem, UpdateProfileRequest, UserData } from "@/types/me";

type AccountFormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  profileDisplayNames: Array<{
    id: string;
    profileType: string;
    displayName: string;
  }>;
};

type SecurityFormState = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  forgotEmail: string;
};

const INITIAL_ACCOUNT_FORM: AccountFormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  avatarUrl: "",
  profileDisplayNames: [],
};

const INITIAL_SECURITY_FORM: SecurityFormState = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
  forgotEmail: "",
};

type SectionKey = "account" | "security" | "terms" | "about";

const MAX_AVATAR_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ProfilePage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  const [accountForm, setAccountForm] = useState<AccountFormState>(
    INITIAL_ACCOUNT_FORM
  );
  const [securityForm, setSecurityForm] = useState<SecurityFormState>(
    INITIAL_SECURITY_FORM
  );

  const [updatingAccount, setUpdatingAccount] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingForgotPassword, setSendingForgotPassword] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentRole = useMemo(() => {
    if (pathname.startsWith("/parent")) return "Phụ huynh";
    if (pathname.startsWith("/teacher")) return "Giáo viên";
    return "Học viên";
  }, [pathname]);

  const isParentOrStudent = useMemo(
    () => pathname.startsWith("/parent") || pathname.startsWith("/student"),
    [pathname]
  );

  const isResponseSuccess = (
    response: { isSuccess?: boolean; success?: boolean } | null | undefined
  ) => {
    if (!response) return false;
    if (typeof response.isSuccess === "boolean") return response.isSuccess;
    if (typeof response.success === "boolean") return response.success;
    return true;
  };

  const resolveActiveRoleProfile = (data: UserData) => {
    const profiles = data.profiles ?? [];

    if (pathname.startsWith("/student")) {
      if (data.selectedProfileId) {
        const selectedProfile = profiles.find(
          (profile) => profile.id === data.selectedProfileId
        );
        if (selectedProfile) return selectedProfile;
      }

      return profiles.find((profile) => profile.profileType === "Student") ?? null;
    }

    if (pathname.startsWith("/parent")) {
      return profiles.find((profile) => profile.profileType === "Parent") ?? null;
    }

    if (pathname.startsWith("/teacher")) {
      return profiles.find((profile) => profile.profileType === "Teacher") ?? null;
    }

    if (data.selectedProfileId) {
      return profiles.find((profile) => profile.id === data.selectedProfileId) ?? null;
    }

    return profiles[0] ?? null;
  };

  const resolveBackendAssetUrl = (rawUrl?: string | null): string => {
    if (!rawUrl) return "";

    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }

    const base = API_CONFIG.BASE_URL || "";
    if (!base) return rawUrl;

    try {
      const origin = new URL(base).origin;
      return `${origin}${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
    } catch {
      return rawUrl;
    }
  };

  const hydrateAccountForm = (data: UserData) => {
    setAccountForm({
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      phoneNumber: data.phoneNumber ?? "",
      avatarUrl: resolveBackendAssetUrl(data.avatarUrl),
      profileDisplayNames: (data.profiles ?? []).map((profile) => ({
        id: profile.id,
        profileType: profile.profileType,
        displayName: profile.displayName ?? "",
      })),
    });

    setSecurityForm((prev) => ({
      ...prev,
      forgotEmail: data.email ?? "",
    }));
  };

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await meService.getMe();

      if (!isResponseSuccess(response) || !response.data) {
        throw new Error(response?.message || "Không thể tải thông tin tài khoản.");
      }

      setUser(response.data);
      const profileContext = meService.extractProfileContext(response.data);

      if (profileContext.studentProfileId) {
        await storage.setItem("selectedProfileId", profileContext.studentProfileId);
      } else {
        await storage.removeItem("selectedProfileId");
      }
      if (profileContext.parentProfileId) {
        await storage.setItem("parentProfileId", profileContext.parentProfileId);
      } else {
        await storage.removeItem("parentProfileId");
      }

      hydrateAccountForm(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Đã xảy ra lỗi khi tải hồ sơ.";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const activeRoleProfile = useMemo(() => {
    if (!user) return null;
    return resolveActiveRoleProfile(user);
  }, [user, pathname]);

  const heroFullName = activeRoleProfile?.displayName || accountForm.fullName;
  const heroAvatarUrl = firstResolvedAssetUrl(
    activeRoleProfile?.avatarUrl,
    user?.avatarUrl,
    accountForm.avatarUrl
  );

  const persistProfile = async (successText: string) => {
    const profileDisplayNames: UpdateProfileDisplayNameItem[] =
      accountForm.profileDisplayNames.map((profile) => ({
        id: profile.id,
        displayName: profile.displayName.trim(),
      }));

    const payload: UpdateProfileRequest = {
      fullName: accountForm.fullName.trim(),
      email: accountForm.email.trim(),
      phoneNumber: accountForm.phoneNumber.trim(),
      profiles: profileDisplayNames,
    };

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phoneNumber ||
      profileDisplayNames.some((profile) => !profile.displayName)
    ) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
    }

    const response = await meService.updateMe(payload);

    if (!isResponseSuccess(response)) {
      throw new Error(response.message || "Cập nhật hồ sơ thất bại.");
    }

    if (response.data) {
      setUser(response.data);
      hydrateAccountForm(response.data);
    } else {
      await loadProfile();
    }

    openSnackbar({ text: successText, type: "success" });
  };

  const handleSaveAccount = async () => {
    try {
      setUpdatingAccount(true);
      await persistProfile("Đã cập nhật thông tin tài khoản.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật hồ sơ.";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setUpdatingAccount(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
      openSnackbar({
        text: "Định dạng ảnh không hợp lệ. Vui lòng dùng JPG, PNG hoặc WEBP.",
        type: "warning",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      openSnackbar({
        text: "Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.",
        type: "warning",
      });
      event.target.value = "";
      return;
    }

    try {
      setUploadingAvatar(true);

      if (!user) {
        throw new Error("Không thể xác định tài khoản hiện tại.");
      }

      const profileContext = meService.extractProfileContext(user);
      const savedStudentProfileId = await storage.getItem("selectedProfileId");
      const studentProfileId =
        profileContext.studentProfileId ?? savedStudentProfileId;

      let targetProfileId: string | null = null;

      if (pathname.startsWith("/parent")) {
        targetProfileId = profileContext.parentProfileId ?? studentProfileId;
      } else if (pathname.startsWith("/student")) {
        targetProfileId =
          studentProfileId ??
          user.profiles.find((profile) => profile.profileType === "Student")?.id ??
          null;
      } else if (pathname.startsWith("/teacher")) {
        targetProfileId =
          user.profiles.find((profile) => profile.profileType === "Teacher")?.id ??
          user.selectedProfileId ??
          null;
      } else {
        targetProfileId =
          studentProfileId ??
          profileContext.parentProfileId ??
          user.profiles[0]?.id ??
          null;
      }

      if (!targetProfileId) {
        throw new Error("Không xác định được profile để cập nhật avatar.");
      }

      // Use dedicated avatar API for profile avatar updates.
      const uploadResponse = await fileService.uploadAvatar(file, targetProfileId);
      if (!isResponseSuccess(uploadResponse as { isSuccess?: boolean; success?: boolean })) {
        throw new Error("Upload avatar thất bại.");
      }

      await loadProfile();
      openSnackbar({ text: "Đã cập nhật avatar thành công.", type: "success" });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật avatar.";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = securityForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      openSnackbar({ text: "Vui lòng nhập đủ thông tin đổi mật khẩu.", type: "warning" });
      return;
    }

    if (newPassword.length < 6) {
      openSnackbar({ text: "Mật khẩu mới cần tối thiểu 6 ký tự.", type: "warning" });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      openSnackbar({ text: "Xác nhận mật khẩu mới chưa khớp.", type: "warning" });
      return;
    }

    try {
      setChangingPassword(true);
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (!isResponseSuccess(response)) {
        throw new Error(response.message || "Đổi mật khẩu thất bại.");
      }

      setSecurityForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      openSnackbar({ text: "Đổi mật khẩu thành công.", type: "success" });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đổi mật khẩu.";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = securityForm.forgotEmail.trim();

    if (!email) {
      openSnackbar({ text: "Vui lòng nhập email để nhận hướng dẫn.", type: "warning" });
      return;
    }

    try {
      setSendingForgotPassword(true);
      const response = await authService.forgetPassword({ email });

      if (!isResponseSuccess(response)) {
        throw new Error(response.message || "Gửi yêu cầu quên mật khẩu thất bại.");
      }

      openSnackbar({
        text: "Đã gửi yêu cầu quên mật khẩu. Vui lòng kiểm tra email.",
        type: "success",
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể gửi yêu cầu quên mật khẩu.";
      openSnackbar({ text: message, type: "error" });
    } finally {
      setSendingForgotPassword(false);
    }
  };

  const handleSwitchProfile = () => {
    navigate("/account-chooser");
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await storage.clearAuth();
      await storage.removeItem("selectedProfileId");
      sessionStorage.removeItem("selectedProfileId");
      openSnackbar({ text: "Đăng xuất thành công.", type: "success" });
      navigate("/", { replace: true });
    } catch {
      openSnackbar({ text: "Không thể đăng xuất. Vui lòng thử lại.", type: "error" });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-full items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      <header className="sticky top-0 z-20 border-b border-red-700 bg-[#BB0000] px-4 py-3 text-white">
        <div className="relative flex items-center justify-center">
          <div>
            <h1 className="text-lg font-bold">Hồ sơ cá nhân</h1>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-4">
        <ProfileHeroCard
          fullName={heroFullName}
          userCode={user?.userName}
          roleLabel={currentRole}
          isActive={Boolean(user?.isActive)}
          avatarUrl={heroAvatarUrl}
          onAvatarClick={handleAvatarClick}
          uploadingAvatar={uploadingAvatar}
        />

        {isParentOrStudent && (
          <section className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSwitchProfile}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-700 active:scale-[0.98]"
            >
              <Users className="h-4 w-4" />
              Chuyển hồ sơ
            </button>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </section>
        )}

        <ProfileAccordionItem
          title="Thông tin cá nhân"
          expanded={activeSection === "account"}
          onToggle={() =>
            setActiveSection((prev) => (prev === "account" ? null : "account"))
          }
          icon={
            <CircleUserRound className="h-7 w-7" strokeWidth={2} />
          }
        >
          <ProfileAccountSection
            fullName={accountForm.fullName}
            email={accountForm.email}
            phoneNumber={accountForm.phoneNumber}
            profileDisplayNames={accountForm.profileDisplayNames}
            onChangeFullName={(value) =>
              setAccountForm((prev) => ({ ...prev, fullName: value }))
            }
            onChangeEmail={(value) =>
              setAccountForm((prev) => ({ ...prev, email: value }))
            }
            onChangePhoneNumber={(value) =>
              setAccountForm((prev) => ({ ...prev, phoneNumber: value }))
            }
            onChangeProfileDisplayName={(profileId, value) =>
              setAccountForm((prev) => ({
                ...prev,
                profileDisplayNames: prev.profileDisplayNames.map((profile) =>
                  profile.id === profileId
                    ? { ...profile, displayName: value }
                    : profile
                ),
              }))
            }
            onSave={() => void handleSaveAccount()}
            loading={updatingAccount}
          />
        </ProfileAccordionItem>

        <ProfileAccordionItem
          title="Bảo mật"
          expanded={activeSection === "security"}
          onToggle={() =>
            setActiveSection((prev) => (prev === "security" ? null : "security"))
          }
          icon={
            <Lock className="h-7 w-7" strokeWidth={2} />
          }
        >
          <ProfileSecuritySection
            currentPassword={securityForm.currentPassword}
            newPassword={securityForm.newPassword}
            confirmNewPassword={securityForm.confirmNewPassword}
            forgotEmail={securityForm.forgotEmail}
            onChangeCurrentPassword={(value) =>
              setSecurityForm((prev) => ({ ...prev, currentPassword: value }))
            }
            onChangeNewPassword={(value) =>
              setSecurityForm((prev) => ({ ...prev, newPassword: value }))
            }
            onChangeConfirmNewPassword={(value) =>
              setSecurityForm((prev) => ({ ...prev, confirmNewPassword: value }))
            }
            onChangeForgotEmail={(value) =>
              setSecurityForm((prev) => ({ ...prev, forgotEmail: value }))
            }
            onChangePassword={() => void handleChangePassword()}
            onForgotPassword={() => void handleForgotPassword()}
            changingPassword={changingPassword}
            sendingForgotPassword={sendingForgotPassword}
          />
        </ProfileAccordionItem>

        <ProfileAccordionItem
          title="Điều khoản sử dụng"
          expanded={activeSection === "terms"}
          onToggle={() =>
            setActiveSection((prev) => (prev === "terms" ? null : "terms"))
          }
          icon={
            <FileText className="h-7 w-7" strokeWidth={2} />
          }
        >
          <ProfileInfoSection type="terms" />
        </ProfileAccordionItem>

        <ProfileAccordionItem
          title="Về Trung tâm Anh ngữ Rex"
          expanded={activeSection === "about"}
          onToggle={() =>
            setActiveSection((prev) => (prev === "about" ? null : "about"))
          }
          icon={
            <Info className="h-7 w-7" strokeWidth={2} />
          }
        >
          <ProfileInfoSection type="about" />
        </ProfileAccordionItem>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc muốn đăng xuất khỏi tài khoản hiện tại không?"
        confirmText={isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        cancelText="Ở lại"
        confirmClassName="bg-[#BB0000] hover:bg-red-800"
        isLoading={isLoggingOut}
        onConfirm={() => {
          void handleLogout();
        }}
        onCancel={() => {
          if (!isLoggingOut) setIsLogoutModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProfilePage;
