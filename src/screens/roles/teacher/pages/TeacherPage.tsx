import React from "react";
import { useNavigate } from "react-router-dom";
import RoleDashboardScaffold, { RoleDashboardSection } from "@/components/role/RoleDashboardScaffold";
import img from "../../../../assets/images/LogoRex.png";

function TeacherPage() {
  const navigate = useNavigate();

  const sections: RoleDashboardSection[] = [
    {
      title: "Giảng dạy",
      description: "Những công cụ chính cho buổi dạy hiệu quả",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          label: "Lớp học của tôi",
          path: "/teacher/my-classes",
          helper: "Danh sách lớp đang phụ trách",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          label: "Lịch giảng dạy",
          path: "/teacher/timetable",
          helper: "Theo dõi lịch theo tuần",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: "Môn học & tài liệu",
          path: "/teacher/subjects",
          helper: "Nội dung và tài nguyên lớp học",
        },
      ],
    },
    {
      title: "Quản lý",
      description: "Theo dõi tiến độ và chăm sóc học viên",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
          label: "Bài tập & nộp bài",
          path: "/teacher/assignments",
          helper: "Danh sách bài tập và hạn nộp",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          label: "Điểm danh",
          path: "/teacher/timetable",
          helper: "Điểm danh theo buổi học",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: "Báo cáo & feedback",
          path: "/teacher/reports",
          helper: "Đánh giá sau mỗi buổi học",
        },
      ],
    },
  ];

  return (
    <RoleDashboardScaffold
      logoSrc={img}
      title="Giáo viên"
      subtitle="Lớp học rõ ràng, quản lý nhanh chóng"
      stats={[
        { label: "Vai trò", value: "Teacher" },
        { label: "Trọng tâm", value: "Giảng dạy" },
        { label: "Mục tiêu", value: "Tiến bộ từng buổi" },
      ]}
      sections={sections}
      onNavigate={(path) => navigate(path)}
    />
  );
}

export default TeacherPage;