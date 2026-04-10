import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";
import { AlertCircle, FileText } from "lucide-react";
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
      if (response.isSuccess ?? response.success) {
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

  const getScoreBadgeClass = (score?: number, maxScore?: number) => {
    if (score == null || !maxScore) return 'bg-slate-100 text-slate-600';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'bg-emerald-100 text-emerald-700';
    if (percentage >= 70) return 'bg-blue-100 text-blue-700';
    if (percentage >= 50) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  const renderExamCard = (exam: Exam) => {
    const examData = exam as Exam & {
      classCode?: string;
      classTitle?: string;
      examDate?: string;
      comment?: string;
      examType?: string;
    };
    const classTitle =  examData.classTitle;
    const examSubject = examData.classCode;
    const startDateTime =  examData.examDate;
    const endDateTime = examData.examDate;

    const isAvailable = isExamAvailable(exam);
    const isPast = isExamPast(exam);

    return (
      <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.classCode}</h3>
            {classTitle && <p className="text-sm text-gray-600">{classTitle}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-gray-500">Bắt đầu:</span>
            <p className="font-medium">{formatDateTime(startDateTime)}</p>
          </div>
          <div>
            <span className="text-gray-500">Kết thúc:</span>
            <p className="font-medium">{formatDateTime(endDateTime)}</p>
          </div>
        </div>

        {exam.maxScore && (
          <div className="mb-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadgeClass(exam.score, exam.maxScore)}`}>
              Điểm: {exam.score}/{exam.maxScore}
            </span>
          </div>
        )}

        {/* Exam Actions */}
        <div className="flex space-x-2">
          
          {isPast && exam.submitted && (
            <button 
              onClick={() => handleViewResult(exam.id)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Xem kết quả
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Page className="flex h-full min-h-0 flex-col bg-gray-100">
        <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
          <h1 className="text-white font-bold text-lg w-full text-center">Bài kiểm tra</h1>
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
        <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
          <h1 className="text-white font-bold text-lg w-full text-center">Bài kiểm tra</h1>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-8 pb-24 flex flex-col items-center text-gray-400">
          <AlertCircle className="mb-3 h-16 w-16" strokeWidth={1.2} />
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
      <div className="shrink-0 bg-[#BB0000] px-4 py-4 flex items-center">
        <h1 className="text-white font-bold text-lg w-full text-center">Bài kiểm tra</h1>
      </div>

      {/* Filter Tabs */}
      <div className="shrink-0 bg-white border-b">
        <div className="flex">
          {[
            { key: 'all', label: 'Tất cả' },
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
            <FileText className="mb-3 h-16 w-16" strokeWidth={1.2} />
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
