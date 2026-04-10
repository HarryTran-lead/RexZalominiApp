import React from "react";
import { Page } from "zmp-ui";
import { BookOpenText } from "lucide-react";

function StudentDocumentsPage() {
  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Tài liệu</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        <div className="px-4 pt-8 flex flex-col items-center text-gray-400">
          <BookOpenText className="mb-3 h-16 w-16" strokeWidth={1.2} />
          <p className="text-sm">Chức năng đang được phát triển</p>
        </div>
      </div>
    </Page>
  );
}

export default StudentDocumentsPage;
