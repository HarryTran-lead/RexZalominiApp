import React from "react";
import { Box } from "zmp-ui";

const roadmapSteps = [
  {
    step: "01",
    title: "Đăng ký & Tư vấn",
    description: "Tư vấn miễn phí về chương trình phù hợp",
  },
  {
    step: "02",
    title: "Kiểm tra đầu vào",
    description: "Đánh giá trình độ để xếp lớp phù hợp",
  },
  {
    step: "03",
    title: "Bắt đầu học",
    description: "Tham gia lớp học và phát triển kỹ năng",
  },
  {
    step: "04",
    title: "Theo dõi & Đánh giá",
    description: "Báo cáo định kỳ về tiến độ học tập",
  },
];

const HomeRoadmap: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Lộ trình <span className="text-blue-600">Học tập</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Quy trình đơn giản, rõ ràng giúp bạn bắt đầu dễ dàng
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {roadmapSteps.map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="text-4xl font-black opacity-30 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm opacity-90">{item.description}</p>
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-blue-300 z-10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomeRoadmap;
