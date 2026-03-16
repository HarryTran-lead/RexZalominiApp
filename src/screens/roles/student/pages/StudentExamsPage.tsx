import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";
import { examService } from "@/services";
import { Exam } from "@/types/student";
import { 
  formatDateTime, 
  getExamStatusColor, 
  getExamStatusText,
  formatDuration,
  isExamAvailable,
  isExamUpcoming,
  isExamPast
} from "@/utils";

function StudentExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'upcoming' | 'completed'>('all');

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await examService.getMyExams();
      if (response.isSuccess) {
        setExams(response.data || []);
      } else {
        setError("Không thể tải danh sách bài kiểm tra");
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError("Đã có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Filter exams based on active tab
  const filteredExams = () => {
    switch (activeTab) {
      case 'available':
        return exams.filter(exam => isExamAvailable(exam));
      case 'upcoming':
        return exams.filter(exam => isExamUpcoming(exam));
      case 'completed':
        return exams.filter(exam => isExamPast(exam));
      default:
        return exams;
    }
  };

  const handleStartExam = (examId: string) => {
    // Navigate to exam taking page
    navigate(`/student/exams/${examId}/take`);
  };

  const handleViewResult = (examId: string) => {
    // Navigate to exam result page
    navigate(`/student/exams/${examId}/result`);
  };

  const renderExamCard = (exam: Exam) => {
    const statusColor = getExamStatusColor(exam.status);
    const statusText = getExamStatusText(exam.status);
    const isAvailable = isExamAvailable(exam);
    const isPast = isExamPast(exam);

    return (
      <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.title}</h3>
            <p className="text-sm text-gray-600">{exam.subject}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
        </div>

        {exam.description && (
          <p className="text-gray-700 text-sm mb-3">{exam.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-gray-500">Bắt đầu:</span>
            <p className="font-medium">{formatDateTime(exam.startTime)}</p>
          </div>
          <div>
            <span className="text-gray-500">Kết thúc:</span>
            <p className="font-medium">{formatDateTime(exam.endTime)}</p>
          </div>
          <div>
            <span className="text-gray-500">Thời gian:</span>
            <p className="font-medium">{formatDuration(exam.durationMinutes)}</p>
          </div>
          <div>
            <span className="text-gray-500">Câu hỏi:</span>
            <p className="font-medium">{exam.totalQuestions} câu</p>
          </div>
        </div>

        {exam.maxScore && (
          <div className="text-sm mb-3">
            <span className="text-gray-500">Điểm tối đa:</span>
            <span className="font-medium ml-1">{exam.maxScore} điểm</span>
          </div>
        )}

        {/* Exam Actions */}
        <div className="flex space-x-2">
          {isAvailable && !exam.submitted && (
            <button 
              onClick={() => handleStartExam(exam.id)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              {(exam.attemptCount || 0) > 0 ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
            </button>
          )}
          
          {isPast && exam.submitted && (
            <button 
              onClick={() => handleViewResult(exam.id)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Xem kết quả
            </button>
          )}

          <button 
            onClick={() => navigate(`/student/exams/${exam.id}/details`)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Chi tiết
          </button>
        </div>

        {/* Show attempts and score if available */}
        {(exam.attemptCount || 0) > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Lần thử:</span>
                <span className="font-medium ml-1">{exam.attemptCount}/{exam.maxAttempts || 'Không giới hạn'}</span>
              </div>
              {exam.score !== undefined && (
                <div>
                  <span className="text-gray-500">Điểm:</span>
                  <span className="font-medium ml-1">{exam.score}/{exam.maxScore}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Page className="flex h-full min-h-0 flex-col bg-gray-100">
        <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="text-white mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg">Bài kiểm tra</h1>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-24 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full mt-3"></div>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page className="flex h-full min-h-0 flex-col bg-gray-100">
        <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="text-white mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg">Bài kiểm tra</h1>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-8 pb-24 flex flex-col items-center text-gray-400">
          <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={fetchExams}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page className="flex h-full min-h-0 flex-col bg-gray-100">
      <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Bài kiểm tra</h1>
      </div>

      {/* Filter Tabs */}
      <div className="shrink-0 bg-white border-b">
        <div className="flex">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'available', label: 'Có thể làm' },
            { key: 'upcoming', label: 'Sắp tới' },
            { key: 'completed', label: 'Đã hoàn thành' }
          ].map(tab => (
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
            </button>
          ))}
        </div>
      </div>

      {/* Exam List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-24">
        {filteredExams().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm">
              {activeTab === 'all' 
                ? 'Chưa có bài kiểm tra nào'
                : `Không có bài kiểm tra ${
                    activeTab === 'available' ? 'có thể làm' :
                    activeTab === 'upcoming' ? 'sắp tới' : 'đã hoàn thành'
                  }`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredExams().map(renderExamCard)}
          </div>
        )}
      </div>
    </Page>
  );
}

export default StudentExamsPage;
