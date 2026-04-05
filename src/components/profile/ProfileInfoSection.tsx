import React from "react";

interface ProfileInfoSectionProps {
  type: "terms" | "about";
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({ type }) => {
  if (type === "terms") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
        <p>
          Khi sử dụng ứng dụng, người dùng đồng ý cung cấp thông tin chính xác,
          bảo mật tài khoản cá nhân và tuân thủ các quy định học tập của Trung tâm
          Anh ngữ Rex. Mọi hành vi sử dụng sai mục đích hoặc xâm phạm quyền riêng tư
          có thể bị giới hạn truy cập.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
      <p>
        Trung tâm Anh ngữ Rex tập trung vào mô hình học cá nhân hóa, theo dõi tiến
        độ minh bạch và đồng hành cùng học viên, phụ huynh, giáo viên trong suốt
        hành trình học tiếng Anh. Ứng dụng giúp kết nối nhanh lịch học, bài tập,
        thông báo và các tác vụ học tập quan trọng mỗi ngày.
      </p>
    </div>
  );
};

export default ProfileInfoSection;
