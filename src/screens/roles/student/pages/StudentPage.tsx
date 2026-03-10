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

function StudentPage() {
  const navigate = useNavigate();

  const sections: MenuSection[] = [
    {
      title: "Học tập",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          label: "Lịch học",
          path: "/student/timetable",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
          label: "Bài tập",
          path: "/student/homework",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          label: "Kiểm tra",
          path: "/student/exams",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: "Tài liệu",
          path: "/student/documents",
        },
      ],
    },
    {
      title: "Hoạt động",
      items: [
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: "Gamification",
          path: "/student/gamification",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: "Application",
          path: "/student/application",
        },
        {
          icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          ),
          label: "Đổi thưởng",
          path: "/student/rewards",
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
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center justify-center">
        <div className="bg-white rounded-xl px-5 py-2 shadow-sm">
          <img src={img} alt="Rex Education" className="h-10 object-contain" />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="px-4 pt-6">
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-red-600 font-bold text-base">{section.title}</h2>
            <div className="w-8 h-1 bg-blue-700 rounded-full mt-1" />
          </div>
          {renderGrid(section.items)}
        </div>
      ))}
    </Page>
  );
}

export default StudentPage;