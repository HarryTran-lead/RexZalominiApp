import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, useSnackbar, Spinner } from "zmp-ui";
import { authService } from "@/services/authService";
import { storage } from "@/utils/storage";
import { UserProfile } from "@/types/auth";

function ParentChildSelectorPage() {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfiles();

      if (response.data) {
        // Filter only Student profiles (children)
        const children = response.data.filter(
          (profile) => profile.profileType === "Student"
        );
        setProfiles(children);

        if (children.length === 0) {
          openSnackbar({
            text: "Không tìm thấy hồ sơ học sinh nào",
            type: "warning",
          });
        }
      } else {
        openSnackbar({
          text: "Không thể lấy danh sách con",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      openSnackbar({
        text: "Đã xảy ra lỗi khi tải danh sách",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = async (profile: UserProfile) => {
    try {
      setSelecting(true);
      const response = await authService.selectStudent({ profileId: profile.id });
      
      // Store the new access token returned by the backend (contains student context)
      if (response?.data?.accessToken) {
        await storage.setAccessToken(response.data.accessToken);
      }

      // Store selected profile ID for reference
      if (profile.studentId) {
        await storage.setItem("selectedStudentId", profile.studentId);
      }
      await storage.setItem("selectedProfileId", profile.id);

      openSnackbar({
        text: `Đã chọn ${profile.displayName}`,
        type: "success",
      });

      // Navigate to parent dashboard
      navigate("/parent", { replace: true });
    } catch (error: any) {
      console.error("Error selecting child:", error);
      const msg = error?.response?.data?.detail ?? "Không thể chọn con";
      openSnackbar({
        text: msg,
        type: "error",
      });
    } finally {
      setSelecting(false);
    }
  };

  const handleBack = () => {
    navigate("/account-chooser");
  };

  return (
    <Page className="relative min-h-screen overflow-hidden bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-slate-900">
      {/* Animated background blobs */}
      <div 
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-300/50 blur-3xl"
        style={{
          animation: "float 6s ease-in-out infinite"
        }}
      />
      <div 
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-red-400/60 blur-3xl"
        style={{
          animation: "float 8s ease-in-out infinite reverse"
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-md px-4 py-2 text-white font-medium hover:bg-white/30 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        {/* Title */}
        <div className="mb-8 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
          <h1 className="mb-2 text-4xl font-black text-white drop-shadow-lg">
            Chọn con
          </h1>
          <p className="text-base text-white/90 font-medium">
            Chọn con để xem thông tin học tập
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center gap-4 text-white">
            <Spinner />
            <p className="text-sm">Đang tải danh sách...</p>
          </div>
        )}

        {/* Children List */}
        {!loading && profiles.length > 0 && (
          <div 
            className="w-full max-w-md space-y-3"
            style={{ animation: "fadeInUp 0.7s ease-out" }}
          >
            {profiles.map((profile, index) => (
              <button
                key={profile.id}
                onClick={() => handleSelectChild(profile)}
                disabled={selecting}
                className="group relative w-full overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-5 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white font-black text-2xl shadow-lg shrink-0">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {profile.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Học sinh
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <svg 
                    className="w-6 h-6 text-red-600 transition-transform group-hover:translate-x-1"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && profiles.length === 0 && (
          <div className="text-center text-white">
            <svg className="w-20 h-20 mx-auto mb-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-semibold mb-2">Chưa có hồ sơ học sinh</p>
            <p className="text-sm opacity-90">Vui lòng liên hệ quản trị viên để được hỗ trợ</p>
          </div>
        )}
      </div>
    </Page>
  );
}

export default ParentChildSelectorPage;
