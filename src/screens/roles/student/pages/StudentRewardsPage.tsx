import React from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

function StudentRewardsPage() {
  const navigate = useNavigate();

  return (
    <Page className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Đổi thưởng</h1>
      </div>
      <div className="px-4 pt-8 flex flex-col items-center text-gray-400">
        <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        <p className="text-sm">Chức năng đang được phát triển</p>
      </div>
    </Page>
  );
}

export default StudentRewardsPage;
