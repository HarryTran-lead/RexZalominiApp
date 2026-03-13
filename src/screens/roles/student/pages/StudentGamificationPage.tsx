import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";
import { gamificationService } from "@/services";
import { 
  StarBalance, 
  StudentLevel, 
  AttendanceStreak,
  StarTransaction
} from "@/types/student";
import { 
  formatStarAmount, 
  calculateLevelProgress,
  formatDateTime
} from "@/utils";

function StudentGamificationPage() {
  const navigate = useNavigate();
  const [starBalance, setStarBalance] = useState<StarBalance | null>(null);
  const [studentLevel, setStudentLevel] = useState<StudentLevel | null>(null);
  const [attendanceStreak, setAttendanceStreak] = useState<AttendanceStreak | null>(null);
  const [starTransactions, setStarTransactions] = useState<StarTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGamificationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all gamification data in parallel
      const [balanceRes, levelRes, streakRes, transactionsRes] = await Promise.all([
        gamificationService.getMyStarBalance(),
        gamificationService.getMyLevel(),
        gamificationService.getMyAttendanceStreak(),
        gamificationService.getStarTransactions({ pageSize: 10 })
      ]);

      // Handle star balance
      if (balanceRes.isSuccess) {
        setStarBalance(balanceRes.data);
      }

      // Handle level
      if (levelRes.isSuccess) {
        setStudentLevel(levelRes.data);
      }

      // Handle attendance streak
      if (streakRes.isSuccess) {
        setAttendanceStreak(streakRes.data);
      }

      // Handle star transactions
      if (transactionsRes.isSuccess) {
        setStarTransactions(transactionsRes.data?.items || []);
      }

    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError('Đã có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const handleCheckIn = async () => {
    try {
      await gamificationService.checkInAttendance();
      // Refresh attendance streak after check-in
      fetchGamificationData();
    } catch (err) {
      console.error('Error checking in:', err);
    }
  };

  if (loading) {
    return (
      <Page className="min-h-screen bg-gray-100 pb-20">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="text-white mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg">Thành tích học tập</h1>
        </div>
        <div className="px-4 py-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page className="min-h-screen bg-gray-100 pb-20">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="text-white mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg">Thành tích học tập</h1>
        </div>
        <div className="px-4 pt-8 flex flex-col items-center text-gray-400">
          <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={fetchGamificationData}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-white mr-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-bold text-lg">Thành tích học tập</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Star Balance Card */}
        {starBalance && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Số sao hiện có</h2>
                <p className="text-2xl font-bold mt-1">⭐ {formatStarAmount(starBalance.balance)}</p>
              </div>
              <div className="text-4xl">🌟</div>
            </div>
          </div>
        )}

        {/* Level Progress Card */}
        {studentLevel && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cấp độ học tập</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Level {studentLevel.level}
              </span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Kinh nghiệm: {studentLevel.currentXp}</span>
                <span>Cần: {studentLevel.xpForNextLevel}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calculateLevelProgress(studentLevel.currentXp, studentLevel.xpForNextLevel)}%` }}
                />
              </div>
            </div>
            
            {studentLevel.levelName && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {studentLevel.levelName}
              </p>
            )}
          </div>
        )}

        {/* Attendance Streak Card */}
        {attendanceStreak && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chuỗi điểm danh</h3>
              <div className="text-2xl">🔥</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{attendanceStreak.currentStreak}</p>
                <p className="text-sm text-gray-600">Thời gian hiện tại</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{attendanceStreak.longestStreak}</p>
                <p className="text-sm text-gray-600">Kỷ lục</p>
              </div>
            </div>
            
            {attendanceStreak.streakBonus > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-700">
                  Phần thưởng chuỗi: <span className="font-semibold">+{attendanceStreak.streakBonus} sao</span>
                </p>
              </div>
            )}

            {attendanceStreak.lastCheckIn && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Điểm danh lần cuối: {formatDateTime(attendanceStreak.lastCheckIn)}
                </p>
              </div>
            )}

            <button 
              onClick={handleCheckIn}
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Điểm danh hôm nay
            </button>
          </div>
        )}

        {/* Recent Star Transactions */}
        {starTransactions.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
              <button 
                onClick={() => navigate('/student/stars/transactions')}
                className="text-red-600 text-sm font-medium"
              >
                Xem tất cả
              </button>
            </div>
            
            <div className="space-y-3">
              {starTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.type === 'Credit' ? '+' : '-'}{transaction.amount} sao
                    </p>
                    {transaction.reason && (
                      <p className="text-sm text-gray-600">{transaction.reason}</p>
                    )}
                    <p className="text-xs text-gray-500">{formatDateTime(transaction.transactionDate)}</p>
                  </div>
                  <div className={`text-lg ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'Credit' ? '⭐' : '🔽'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

export default StudentGamificationPage;
