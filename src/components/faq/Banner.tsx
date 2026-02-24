import React from "react";
import { Box } from "zmp-ui";

const FAQBanner: React.FC = () => {
  return (
    <Box className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 py-16 px-4">
      {/* Backgrounds */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
          <span className="text-2xl">❓</span>
          <span className="font-semibold">Hỗ trợ & Hướng dẫn</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">
          Câu hỏi <span className="text-amber-300">Thường gặp</span>
        </h1>
        <div className="h-1.5 w-24 bg-yellow-300 rounded-full mx-auto mb-6" />

        {/* Subtitle */}
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Tìm câu trả lời cho những thắc mắc phổ biến về chương trình học và dịch vụ của chúng tôi
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold mb-1">50+</div>
            <div className="text-sm">Câu hỏi</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold mb-1">5</div>
            <div className="text-sm">Chủ đề</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-300 mb-1">24/7</div>
            <div className="text-sm">Hỗ trợ</div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default FAQBanner;
