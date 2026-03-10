import React from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";

function ParentNotificationsPage() {
  const navigate = useNavigate();

  return (
    <Page className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Thông báo</h1>
      </div>
      <div className="px-4 pt-8 flex flex-col items-center text-gray-400">
        <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="text-sm">Chức năng đang được phát triển</p>
      </div>
    </Page>
  );
}

export default ParentNotificationsPage;
