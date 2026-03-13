import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "zmp-ui";
import { gamificationService } from "@/services";
import { 
  StarBalance, 
  Reward,
  RewardRedemption
} from "@/types/student";
import { 
  formatStarAmount, 
  calculateLevelProgress,
  formatDateTime,
  getRewardRedemptionStatusColor,
  getRewardRedemptionStatusText
} from "@/utils";

function StudentRewardsPage() {
  const navigate = useNavigate();
  const [starBalance, setStarBalance] = useState<StarBalance | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all needed data
      const [balanceRes, rewardsRes, redemptionsRes] = await Promise.all([
        gamificationService.getMyStarBalance(),
        gamificationService.getAvailableRewards(),
        gamificationService.getMyRedemptions({ pageSize: 20 })
      ]);

      // Handle star balance
      if (balanceRes.isSuccess) {
        setStarBalance(balanceRes.data);
      }

      // Handle rewards
      if (rewardsRes.isSuccess) {
        setRewards(rewardsRes.data || []);
      }

      // Handle redemptions
      if (redemptionsRes.isSuccess) {
        setRedemptions(redemptionsRes.data?.items || []);
      }

    } catch (err) {
      console.error('Error fetching rewards data:', err);
      setError('Đã có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeemReward = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      const response = await gamificationService.redeemReward(rewardId);
      if (response.isSuccess) {
        // Refresh data after successful redemption
        await fetchData();
        // Show success message (you can add toast notification here)
        alert('Đổi thưởng thành công!');
      } else {
        alert('Không thể đổi thưởng. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Error redeeming reward:', err);
      alert('Đã có lỗi xảy ra khi đổi thưởng');
    } finally {
      setRedeeming(null);
    }
  };

  const renderRewardCard = (reward: Reward) => {
    const canAfford = starBalance && starBalance.balance >= reward.starCost;
    const isRedeeming = redeeming === reward.id;

    return (
      <div key={reward.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{reward.name}</h3>
            {reward.description && (
              <p className="text-sm text-gray-600">{reward.description}</p>
            )}
          </div>
          <div className="ml-4 text-right">
            <div className="flex items-center text-yellow-600">
              <span className="text-lg font-bold">⭐ {formatStarAmount(reward.starCost)}</span>
            </div>
            {reward.category && (
              <span className="text-xs text-gray-500">{reward.category}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {reward.validFrom && (
            <div>
              <span className="text-gray-500">Có hiệu lực từ:</span>
              <p className="font-medium">{formatDateTime(reward.validFrom)}</p>
            </div>
          )}
          {reward.validUntil && (
            <div>
              <span className="text-gray-500">Có hiệu lực đến:</span>
              <p className="font-medium">{formatDateTime(reward.validUntil)}</p>
            </div>
          )}
          {reward.quantity && (
            <div>
              <span className="text-gray-500">Số lượng còn lại:</span>
              <p className="font-medium">{reward.availableQuantity || 0}/{reward.quantity}</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => handleRedeemReward(reward.id)}
          disabled={!canAfford || !reward.isActive || isRedeeming || (reward.availableQuantity === 0)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            canAfford && reward.isActive && !isRedeeming && (reward.availableQuantity ?? 1) > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRedeeming ? 'Đang đổi...' : 
           !canAfford ? 'Không đủ sao' :
           !reward.isActive ? 'Không khả dụng' :
           (reward.availableQuantity ?? 1) === 0 ? 'Hết hàng' :
           'Đổi thưởng'}
        </button>

        {!canAfford && starBalance && (
          <p className="text-sm text-red-500 mt-2 text-center">
            Bạn cần thêm {formatStarAmount(reward.starCost - starBalance.balance)} sao
          </p>
        )}
      </div>
    );
  };

  const renderRedemptionCard = (redemption: RewardRedemption) => {
    const statusColor = getRewardRedemptionStatusColor(redemption.status);
    const statusText = getRewardRedemptionStatusText(redemption.status);

    return (
      <div key={redemption.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{redemption.item?.title || 'Phần thưởng'}</h3>
            <p className="text-sm text-gray-600">Ngày đổi: {formatDateTime(redemption.requestedAt)}</p>
          </div>
          <div className="ml-4 text-right">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
              {statusText}
            </span>
            <div className="flex items-center text-red-600 mt-1">
              <span className="text-sm font-bold">-⭐ {formatStarAmount(redemption.totalCostStars)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span className="text-gray-500">Số lượng:</span>
            <span className="font-medium ml-1">{redemption.quantity}</span>
          </div>
          {redemption.processedAt && (
            <div>
              <span className="text-gray-500">Xử lý:</span>
              <p className="font-medium">{formatDateTime(redemption.processedAt)}</p>
            </div>
          )}
        </div>

        {redemption.item?.description && (
          <p className="text-sm text-gray-600 mb-3">{redemption.item.description}</p>
        )}
      </div>
    );
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
          <h1 className="text-white font-bold text-lg">Đổi thưởng</h1>
        </div>
        <div className="px-4 py-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
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
          <h1 className="text-white font-bold text-lg">Đổi thưởng</h1>
        </div>
        <div className="px-4 pt-8 flex flex-col items-center text-gray-400">
          <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={fetchData}
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
        <h1 className="text-white font-bold text-lg">Đổi thưởng</h1>
      </div>

      {/* Star Balance Header */}
      {starBalance && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 mx-4 my-4 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-100">Số sao hiện có</p>
              <p className="text-2xl font-bold">⭐ {formatStarAmount(starBalance.balance)}</p>
            </div>
            <div className="text-3xl">🌟</div>
          </div>
        </div>
      )}

      {/* Custom Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'rewards' 
                ? 'border-red-600 text-red-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Phần thưởng
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'history' 
                ? 'border-red-600 text-red-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Lịch sử đổi thưởng
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === 'rewards' ? (
          <>
            {rewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <p className="text-sm">Chưa có phần thưởng nào</p>
              </div>
            ) : (
              <div className="space-y-0">
                {rewards.map(renderRewardCard)}
              </div>
            )}
          </>
        ) : (
          <>
            {redemptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <p className="text-sm">Chưa có lịch sử đổi thưởng</p>
              </div>
            ) : (
              <div className="space-y-0">
                {redemptions.map(renderRedemptionCard)}
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}

export default StudentRewardsPage;
