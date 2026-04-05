import React from "react";

interface ProfileHeroCardProps {
  fullName: string;
  userCode?: string;
  roleLabel: string;
  isActive: boolean;
  avatarUrl?: string;
  onAvatarClick: () => void;
  uploadingAvatar?: boolean;
}

const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  fullName,
  userCode,
  roleLabel,
  isActive,
  avatarUrl,
  onAvatarClick,
  uploadingAvatar = false,
}) => {
  return (
    <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={onAvatarClick}
          className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-red-500 to-red-600 shadow-lg ring-2 ring-red-100"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
              {(fullName?.[0] || "U").toUpperCase()}
            </div>
          )}

          <span className="absolute bottom-1 right-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
            {uploadingAvatar ? "Đang tải..." : "Đổi ảnh"}
          </span>
        </button>

        <h2 className="mt-4 text-2xl font-extrabold uppercase tracking-wide text-slate-900">
          {fullName || "Người dùng"}
        </h2>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Vai trò: {roleLabel}
          </span>
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
            {isActive ? "Đã xác thực" : "Chưa xác thực"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeroCard;
