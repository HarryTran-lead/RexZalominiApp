import React from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

function StudentApplicationPage() {
  const navigate = useNavigate();

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Application</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        <div className="px-4 pt-8 flex flex-col items-center text-gray-400">
          <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Chức năng đang được phát triển</p>
        </div>
      </div>
    </Page>
  );
}

export default StudentApplicationPage;
