import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ProfileSecuritySectionProps {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  forgotEmail: string;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangeConfirmNewPassword: (value: string) => void;
  onChangeForgotEmail: (value: string) => void;
  onChangePassword: () => void;
  onForgotPassword: () => void;
  changingPassword: boolean;
  sendingForgotPassword: boolean;
}

const PasswordInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};

const ProfileSecuritySection: React.FC<ProfileSecuritySectionProps> = ({
  currentPassword,
  newPassword,
  confirmNewPassword,
  forgotEmail,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangeConfirmNewPassword,
  onChangeForgotEmail,
  onChangePassword,
  onForgotPassword,
  changingPassword,
  sendingForgotPassword,
}) => {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h4 className="mb-3 text-sm font-bold text-slate-800">Đổi mật khẩu</h4>
        <div className="space-y-2">
          <PasswordInput
            value={currentPassword}
            onChange={onChangeCurrentPassword}
            placeholder="Mật khẩu hiện tại"
          />
          <PasswordInput
            value={newPassword}
            onChange={onChangeNewPassword}
            placeholder="Mật khẩu mới"
          />
          <PasswordInput
            value={confirmNewPassword}
            onChange={onChangeConfirmNewPassword}
            placeholder="Xác nhận mật khẩu mới"
          />
        </div>
        <button
          type="button"
          onClick={onChangePassword}
          disabled={changingPassword}
          className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60"
        >
          {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h4 className="mb-3 text-sm font-bold text-slate-800">Quên mật khẩu</h4>
        <input
          value={forgotEmail}
          onChange={(e) => onChangeForgotEmail(e.target.value)}
          type="email"
          placeholder="Nhập email nhận hướng dẫn"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
        />
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={sendingForgotPassword}
          className="mt-3 w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition active:scale-95 disabled:opacity-60"
        >
          {sendingForgotPassword ? "Đang gửi..." : "Gửi yêu cầu quên mật khẩu"}
        </button>
      </div>
    </div>
  );
};

export default ProfileSecuritySection;
