import React from "react";

interface ProfileAccountSectionProps {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  onChangeEmail: (value: string) => void;
  onChangePhoneNumber: (value: string) => void;
  onChangeAvatarUrl: (value: string) => void;
  onSave: () => void;
  loading: boolean;
}

const ProfileAccountSection: React.FC<ProfileAccountSectionProps> = ({
  fullName,
  email,
  phoneNumber,
  avatarUrl,
  onChangeEmail,
  onChangePhoneNumber,
  onChangeAvatarUrl,
  onSave,
  loading,
}) => {
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-slate-800">Họ và tên</span>
        <input
          value={fullName}
          readOnly
          disabled
          className="w-full text-sm text-slate-700"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-semibold text-slate-800">Email</span>
        <input
          value={email}
          readOnly
          disabled
          className="w-full  text-sm text-slate-700"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-800">
          Số điện thoại
        </span>
        <input
          value={phoneNumber}
          readOnly
          disabled
          className="w-full text-sm text-slate-700"
        />
      </label>
    </div>
  );
};

export default ProfileAccountSection;
