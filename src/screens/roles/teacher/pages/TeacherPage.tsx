import React from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";
import img from "../../../../assets/images/LogoRex.png";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

function TeacherPage() {
  const navigate = useNavigate();

  const sections: MenuSection[] = [
    {
      title: "Giảng dạy",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          label: "Lớp học của tôi",
          path: "/teacher/my-classes",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          label: "Lịch giảng dạy",
          path: "/teacher/timetable",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: "Môn học & tài liệu",
          path: "/teacher/subjects",
        },
      ],
    },
    {
      title: "Quản lý",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
          label: "Bài tập & nộp bài",
          path: "/teacher/assignments",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          label: "Điểm danh",
          path: "/teacher/timetable",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: "Báo cáo & feedback",
          path: "/teacher/reports",
        },
      ],
    },
  ];

  const renderGrid = (items: MenuItem[]) => (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, idx) => {
        const isOdd = items.length % 2 !== 0 && idx === items.length - 1;
        return (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            className={`bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform ${isOdd ? "col-span-2 max-w-[50%] mx-auto w-full" : ""}`}
          >
            <span className="text-red-500">{item.icon}</span>
            <span className="text-red-500 font-semibold text-sm text-center">{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <Page className="min-h-screen bg-gray-100 pb-20">
      {/* Red Header Banner */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center justify-center">
        <div className="bg-white rounded-xl px-5 py-2 shadow-sm">
          <img src={img} alt="Rex Education" className="h-10 object-contain" />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="px-4 pt-6">
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-red-600 font-bold text-base">{section.title}</h2>
            <div className="w-8 h-1 bg-red-600 rounded-full mt-1" />
          </div>
          {renderGrid(section.items)}
        </div>
      ))}
    </Page>
  );
}

export default TeacherPage;