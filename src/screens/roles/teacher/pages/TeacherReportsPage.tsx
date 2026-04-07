import React from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";
import ReportPageHeader from "@/components/report/ReportPageHeader";

const TeacherReportsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <ReportPageHeader
        title="Báo cáo buổi học"
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-5 pb-24">
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-800">Chức năng báo cáo</h2>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => navigate("/teacher/reports/create")}
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-left text-white shadow-sm"
            >
              <p className="text-sm font-semibold">Gửi báo cáo buổi học</p>
              <p className="mt-0.5 text-xs text-red-100">
                Chọn buổi học, chọn học viên và viết đánh giá để gửi staff duyệt.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/teacher/reports/list")}
              className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-red-700"
            >
              <p className="text-sm font-semibold">Danh sách báo cáo</p>
              <p className="mt-0.5 text-xs text-red-500">
                Xem các báo cáo đã tạo, trạng thái duyệt và gửi duyệt nháp còn thiếu.
              </p>
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default TeacherReportsPage;
