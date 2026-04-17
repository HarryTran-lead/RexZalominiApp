import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookOpenText,
  Building2,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  ClipboardCheck,
} from "lucide-react";
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
          icon: <Building2 className="w-10 h-10" strokeWidth={1.5} />,
          label: "Lớp học của tôi",
          path: "/teacher/my-classes",
          helper: "Danh sách lớp đang phụ trách",
        },
        {
          icon: <CalendarDays className="w-10 h-10" strokeWidth={1.5} />,
          label: "Lịch giảng dạy",
          path: "/teacher/timetable",
          helper: "Theo dõi lịch theo tuần",
        },
        {
          icon: <BookOpen className="w-10 h-10" strokeWidth={1.5} />,
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
          icon: <BookOpenText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Bài tập & nộp bài",
          path: "/teacher/assignments",
          helper: "Danh sách bài tập và hạn nộp",
        },
        {
          icon: <ClipboardCheck className="w-10 h-10" strokeWidth={1.5} />,
          label: "Điểm danh",
          path: "/teacher/timetable",
          helper: "Điểm danh theo buổi học",
        },
        {
          icon: <ChartColumn className="w-10 h-10" strokeWidth={1.5} />,
          label: "Báo cáo buổi học",
          path: "/teacher/reports",
          helper: "Đánh giá sau mỗi buổi học",
        },
        {
          icon: <CalendarRange className="w-10 h-10" strokeWidth={1.5} />,
          label: "Báo cáo tháng",
          path: "/teacher/monthly-reports",
          helper: "Xem tổng hợp theo tháng và mở chi tiết",
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