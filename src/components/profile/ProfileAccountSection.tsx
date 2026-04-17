import React from "react";

interface ProfileDisplayNameItem {
  id: string;
  profileType: string;
  displayName: string;
}

interface ProfileAccountSectionProps {
  fullName: string;
  email: string;
  phoneNumber: string;
  profileDisplayNames: ProfileDisplayNameItem[];
  onChangeFullName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePhoneNumber: (value: string) => void;
  onChangeProfileDisplayName: (profileId: string, value: string) => void;
  onSave: () => void;
  loading: boolean;
}

const ProfileAccountSection: React.FC<ProfileAccountSectionProps> = ({
  fullName,
  email,
  phoneNumber,
  profileDisplayNames,
  onChangeFullName,
  onChangeEmail,
  onChangePhoneNumber,
  onChangeProfileDisplayName,
  onSave,
  loading,
}) => {
  const resolveRoleLabel = (profileType: string) => {
    if (profileType === "Parent") return "Phụ huynh";
    if (profileType === "Student") return "Học sinh";
    if (profileType === "Teacher") return "Giáo viên";
    return profileType;
  };

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-slate-800">Họ và tên</span>
        <input
          value={fullName}
          onChange={(event) => onChangeFullName(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-semibold text-slate-800">Email</span>
        <input
          value={email}
          onChange={(event) => onChangeEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-800">
          Số điện thoại
        </span>
        <input
          value={phoneNumber}
          onChange={(event) => onChangePhoneNumber(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
      </label>

      {profileDisplayNames.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tên hiển thị profile
          </p>
          {profileDisplayNames.map((profile) => (
            <label key={profile.id} className="block space-y-1">
              <span className="text-xs font-semibold text-slate-700">
                {resolveRoleLabel(profile.profileType)}
              </span>
              <input
                value={profile.displayName}
                onChange={(event) =>
                  onChangeProfileDisplayName(profile.id, event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </label>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="w-full rounded-2xl bg-[#BB0000] px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-red-300"
      >
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
};

export default ProfileAccountSection;
