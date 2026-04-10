import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Spinner, useSnackbar } from "zmp-ui";
import ProfileAccordionItem from "@/components/profile/ProfileAccordionItem";
import ProfileAccountSection from "@/components/profile/ProfileAccountSection";
import ProfileHeroCard from "@/components/profile/ProfileHeroCard";
import ProfileInfoSection from "@/components/profile/ProfileInfoSection";
import ProfileSecuritySection from "@/components/profile/ProfileSecuritySection";
import { CircleUserRound, FileText, Info, Lock, RotateCw } from "lucide-react";
import { API_CONFIG } from "@/constants/apiURL";
import { authService } from "@/services/authService";
import { fileService } from "@/services/fileService";
import { meService } from "@/services/meService";
import { UpdateProfileRequest, UserData } from "@/types/me";

type AccountFormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
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
};

const INITIAL_SECURITY_FORM: SecurityFormState = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
  forgotEmail: "",
};

type SectionKey = "account" | "security" | "terms" | "about";

const ProfilePage: React.FC = () => {
  const { pathname } = useLocation();
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

  const currentRole = useMemo(() => {
    if (pathname.startsWith("/parent")) return "Phụ huynh";
    if (pathname.startsWith("/teacher")) return "Giáo viên";
    return "Học viên";
  }, [pathname]);

  const isResponseSuccess = (
    response: { isSuccess?: boolean; success?: boolean } | null | undefined
  ) => {
    if (!response) return false;
    if (typeof response.isSuccess === "boolean") return response.isSuccess;
    if (typeof response.success === "boolean") return response.success;
    return true;
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

  const extractFileUrl = (uploadResponse: unknown): string | undefined => {
    if (!uploadResponse) return undefined;

    if (typeof uploadResponse === "string") {
      return uploadResponse;
    }

    const root = uploadResponse as Record<string, unknown>;
    const rootUrl =
      (root.url as string | undefined) ||
      (root.fileUrl as string | undefined) ||
      (root.secureUrl as string | undefined) ||
      (root.secure_url as string | undefined);

    if (rootUrl) return rootUrl;

    const nested = root.data as Record<string, unknown> | undefined;
    if (!nested) return undefined;

    return (
      (nested.url as string | undefined) ||
      (nested.fileUrl as string | undefined) ||
      (nested.secureUrl as string | undefined) ||
      (nested.secure_url as string | undefined)
    );
  };

  const normalizeApiResponse = (response: unknown) => {
    if (!response || typeof response !== "object") {
      return {
        success: true,
        data: response,
        message: undefined as string | undefined,
      };
    }

    const payload = response as Record<string, unknown>;
    const success =
      typeof payload.isSuccess === "boolean"
        ? payload.isSuccess
        : typeof payload.success === "boolean"
          ? payload.success
          : true;

    return {
      success,
      data: payload.data,
      message: typeof payload.message === "string" ? payload.message : undefined,
    };
  };

  const hydrateAccountForm = (data: UserData) => {
    setAccountForm({
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      phoneNumber: data.phoneNumber ?? "",
      avatarUrl: resolveBackendAssetUrl(data.avatarUrl),
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

  const persistProfile = async (
    nextData: Partial<UpdateProfileRequest>,
    successText: string
  ) => {
    const payload: UpdateProfileRequest = {
      fullName: accountForm.fullName.trim(),
      email: accountForm.email.trim(),
      phoneNumber: accountForm.phoneNumber.trim(),
      avatarUrl: accountForm.avatarUrl.trim() || undefined,
      ...nextData,
    };

    if (!payload.fullName || !payload.email || !payload.phoneNumber) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
    }

    const response = await meService.updateMe(payload);

    if (!isResponseSuccess(response)) {
      throw new Error(response.message || "Cập nhật hồ sơ thất bại.");
    }

    if (response.data) {
      setUser(response.data);
      hydrateAccountForm(response.data);
    }

    openSnackbar({ text: successText, type: "success" });
  };

  const handleSaveAccount = async () => {
    try {
      setUpdatingAccount(true);
      await persistProfile({}, "Đã cập nhật thông tin tài khoản.");
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

    try {
      setUploadingAvatar(true);

      // Use dedicated avatar API for profile avatar updates.
      const uploadResponse = await fileService.uploadAvatar(file);
      const uploadMeta = normalizeApiResponse(uploadResponse);

      if (!uploadMeta.success) {
        throw new Error(uploadMeta.message || "Upload avatar thất bại.");
      }

      // Some BE responses are wrapped ({data: {url}}), some are direct ({url}).
      const rawUrl = extractFileUrl(uploadMeta.data ?? uploadResponse);
      if (!rawUrl) {
        throw new Error("Không đọc được URL avatar từ API upload.");
      }

      const avatarUrl = resolveBackendAssetUrl(rawUrl);
      setAccountForm((prev) => ({ ...prev, avatarUrl }));

      await persistProfile(
        {
          avatarUrl,
        },
        "Đã cập nhật avatar thành công."
      );
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
        accept="image/*"
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
          fullName={accountForm.fullName}
          userCode={user?.userName}
          roleLabel={currentRole}
          isActive={Boolean(user?.isActive)}
          avatarUrl={accountForm.avatarUrl}
          onAvatarClick={handleAvatarClick}
          uploadingAvatar={uploadingAvatar}
        />

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
            avatarUrl={accountForm.avatarUrl}
            onChangeEmail={(value) =>
              setAccountForm((prev) => ({ ...prev, email: value }))
            }
            onChangePhoneNumber={(value) =>
              setAccountForm((prev) => ({ ...prev, phoneNumber: value }))
            }
            onChangeAvatarUrl={(value) =>
              setAccountForm((prev) => ({ ...prev, avatarUrl: value }))
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
    </div>
  );
};

export default ProfilePage;
