import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Gift,
  Smile,
} from "lucide-react";
import RoleDashboardScaffold, { RoleDashboardSection } from "@/components/role/RoleDashboardScaffold";
import img from "../../../../assets/images/LogoRex.png";

function StudentPage() {
  const navigate = useNavigate();

  const sections: RoleDashboardSection[] = [
    {
      title: "Học tập",
      description: "Mọi nội dung học trong một chạm",
      items: [
        {
          icon: <CalendarDays className="w-10 h-10" strokeWidth={1.5} />,
          label: "Lịch học",
          path: "/student/timetable",
          helper: "Xem lịch tuần và buổi tới",
        },
        {
          icon: <BookOpenText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Bài tập",
          path: "/student/homework",
          helper: "Theo dõi deadline dễ hơn",
        },
        {
          icon: <ClipboardCheck className="w-10 h-10" strokeWidth={1.5} />,
          label: "Kiểm tra",
          path: "/student/exams",
          helper: "Bài kiểm tra và kết quả",
        },
        {
          icon: <BookOpen className="w-10 h-10" strokeWidth={1.5} />,
          label: "Tài liệu",
          path: "/student/documents",
          helper: "Tài nguyên học tập",
        },
      ],
    },
    {
      title: "Hoạt động",
      description: "Tăng động lực học mỗi ngày",
      items: [
        {
          icon: <Smile className="w-10 h-10" strokeWidth={1.5} />,
          label: "Gamification",
          path: "/student/gamification",
          helper: "Theo dõi sao và thành tích",
        },
        {
          icon: <FileText className="w-10 h-10" strokeWidth={1.5} />,
          label: "Đơn hỗ trợ",
          path: "/student/application",
          helper: "Nộp yêu cầu nhanh",
        },
        {
          icon: <Gift className="w-10 h-10" strokeWidth={1.5} />,
          label: "Đổi thưởng",
          path: "/student/rewards",
          helper: "Đổi sao lấy quà",
        },
      ],
    },
  ];

  return (
    <RoleDashboardScaffold
      logoSrc={img}
      title="Học viên"
      subtitle="Học vui, tiến bộ đều mỗi ngày"
      stats={[
        { label: "Mục tiêu", value: "Tự tin Anh ngữ" },
        { label: "Độ tuổi", value: "6-14" },
        { label: "Vai trò", value: "Student" },
      ]}
      sections={sections}
      onNavigate={(path) => navigate(path)}
    />
  );
}

export default StudentPage;