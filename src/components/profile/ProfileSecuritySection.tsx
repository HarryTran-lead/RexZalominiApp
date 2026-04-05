import React, { useState } from "react";

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

const EyeIcon: React.FC<{ shown: boolean }> = ({ shown }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    {shown ? (
      <>
        <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.58 10.58a2 2 0 102.83 2.83" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.88 5.09A9.77 9.77 0 0112 5c7 0 10 7 10 7a17.56 17.56 0 01-3.16 4.19M6.71 6.72C3.74 8.8 2 12 2 12a17.59 17.59 0 004.23 4.9A9.76 9.76 0 0012 19c1.61 0 3.1-.39 4.42-1.09" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

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
        <EyeIcon shown={show} />
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
