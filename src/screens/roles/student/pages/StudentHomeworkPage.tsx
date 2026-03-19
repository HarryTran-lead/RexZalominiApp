import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, List } from "zmp-ui";
import { studentService } from "@/services";
import { HomeworkAssignment, HomeworkQueryParams } from "@/types/student";
import { 
  formatDate, 
  formatDateTime,
  getHomeworkStatusColor, 
  getHomeworkStatusText, 
  isHomeworkOverdue,
  getHomeworkDaysUntilDue,
  truncateText
} from "@/utils";

function StudentHomeworkPage() {
  const navigate = useNavigate();
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Submitted' | 'Assigned' | 'Missing' | 'Graded'>('All');

  const fetchHomework = async (status?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: HomeworkQueryParams = {
        pageSize: 20,
        pageNumber: 1,
      };
      
      if (status && status !== 'All') {
        params.status = status;
      }
      
      const response = await studentService.getMyHomework(params);

      if (response.isSuccess && response.data) {
        const data = response.data as any;
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.homeworks?.items)
            ? data.homeworks.items
            : Array.isArray(data)
              ? data
              : [];
        setHomework(items);
      } else {
        setError("Không thể tải danh sách bài tập");
      }
    } catch (err) {
      console.error('Error fetching homework:', err);
      setError('Đã có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework(activeTab === 'All' ? undefined : activeTab);
  }, [activeTab]);

  const handleHomeworkClick = (homeworkAssignment: HomeworkAssignment) => {
    // Navigate to homework detail page
    navigate(`/student/homework/${homeworkAssignment.id}`);
  };

  const getDueDateInfo = (homework: HomeworkAssignment) => {
    if (!homework.dueAt) return { text: '', color: '' };
    
    const daysUntilDue = getHomeworkDaysUntilDue(homework.dueAt);
    const isOverdue = isHomeworkOverdue(homework);
    
    if (isOverdue) {
      return { 
        text: `Quá hạn ${Math.abs(daysUntilDue || 0)} ngày`, 
        color: 'text-red-600' 
      };
    } else if (daysUntilDue === 0) {
      return { text: 'Hạn nộp hôm nay', color: 'text-orange-600' };
    } else if (daysUntilDue === 1) {
      return { text: 'Hạn nộp ngày mai', color: 'text-orange-500' };
    } else if ((daysUntilDue || 0) <= 3) {
      return { text: `Còn ${daysUntilDue} ngày`, color: 'text-yellow-600' };
    } else {
      return { text: formatDate(homework.dueAt), color: 'text-gray-500' };
    }
  };

  // Sửa getTabCount - thêm optional chaining
const getTabCount = (status: string) => {
  if (status === 'All') return homework.length;
  return homework.filter(item => item.status?.toLowerCase() === status.toLowerCase()).length;
};

// Sửa renderHomeworkItem - dùng isOverdue trực tiếp từ API thay vì gọi function
const renderHomeworkItem = (item: HomeworkAssignment) => {
  const dueDateInfo = getDueDateInfo(item);
  const isOverdueItem = item.isOverdue ?? isHomeworkOverdue(item); // ← API đã có field này

  return (
    <div
      key={item.id}
      onClick={() => handleHomeworkClick(item)}
      className={`mb-2 rounded-lg border ${isOverdueItem ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'} shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-gray-900 flex-1 mr-2">
            {truncateText(item.assignmentTitle ?? '', 60)}  {/* ← đúng field name */}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getHomeworkStatusColor(item.status ?? '')} bg-gray-100`}>
            {getHomeworkStatusText(item.status ?? '')}
          </span>
        </div>

        {item.assignmentDescription && (
          <p className="text-sm text-gray-600">
            {truncateText(item.assignmentDescription, 100)}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="space-y-1">
            {item.classTitle && (
              <div>Lớp: {item.classCode ? `${item.classCode} - ` : ''}{item.classTitle}</div>
            )}
            {item.book && (
              <div>Sách: {item.book} {item.pages && `(trang ${item.pages})`}</div>
            )}
          </div>
          <div className="text-right space-y-1">
            {dueDateInfo.text && (
              <div className={dueDateInfo.color}>{dueDateInfo.text}</div>
            )}
          </div>
        </div>

        {item.score != null && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Điểm số:</span>
            <span className="font-medium text-green-600">{item.score}/{item.maxScore}</span>
          </div>
        )}

        {item.submittedAt && (
          <div className="text-xs text-gray-500">
            Nộp lúc: {formatDateTime(item.submittedAt)}
          </div>
        )}
      </div>
    </div>
  );
};

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Bài tập</h1>
      </div>

      {/* Filter Tabs */}
      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="flex space-x-0">
          {[
            { key: 'All', label: 'Tất cả' },
            { key: 'Missing', label: 'Chưa nộp' },
            { key: 'Submitted', label: 'Đã nộp' },
            { key: 'Graded', label: 'Đã chấm' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === tab.key
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {getTabCount(tab.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-24">
        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-red-600 text-sm">{error}</div>
            <button 
              onClick={() => fetchHomework(activeTab === 'All' ? undefined : activeTab)}
              className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {homework.length === 0 ? (
              <div className="pt-8 flex flex-col items-center text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">Không có bài tập nào</p>
              </div>
            ) : (
              <List className="space-y-2">
                {homework.map(renderHomeworkItem)}
              </List>
            )}
          </>
        )}
        
      </div>
    </Page>
  );
}

export default StudentHomeworkPage;
