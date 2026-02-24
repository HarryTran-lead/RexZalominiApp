import React, { useState, useEffect, useCallback } from "react";
import { Box } from "zmp-ui";

const slides = [
  {
    id: 1,
    badge: "✨ Chào mừng đến với RexKidzGo",
    title: "Học Tiếng Anh",
    highlight: "Vui & Hiệu Quả",
    description: "Phương pháp học tiếng Anh hiện đại, giúp trẻ tự tin giao tiếp và phát triển toàn diện",
    gradient: "from-blue-500 via-purple-500 to-pink-500"
  },
  {
    id: 2,
    badge: "🎯 Phương pháp giảng dạy chuẩn quốc tế",
    title: "Chương Trình",
    highlight: "Cambridge & Oxford",
    description: "Áp dụng chương trình học chuẩn quốc tế, phát triển 4 kỹ năng: Nghe - Nói - Đọc - Viết",
    gradient: "from-green-500 via-teal-500 to-blue-500"
  },
  {
    id: 3,
    badge: "👨‍🏫 Đội ngũ giáo viên tận tâm",
    title: "Giáo Viên",
    highlight: "Chuyên Nghiệp",
    description: "Đội ngũ giáo viên có trình độ cao, nhiều kinh nghiệm và đam mê với giáo dục trẻ em",
    gradient: "from-orange-500 via-red-500 to-pink-500"
  }
];

const HomeHero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <Box 
      className={`relative min-h-screen bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center px-4 transition-all duration-700 ease-in-out`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all active:scale-95 border border-white/30"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all active:scale-95 border border-white/30"
        aria-label="Next slide"
      >
        →
      </button>

      {/* Content */}
      <div className="relative z-10 text-center text-white">
        <div 
          key={currentSlide}
          className="animate-fadeIn"
        >
          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold border border-white/30 mb-6">
              {slides[currentSlide].badge}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">
            {slides[currentSlide].title} <br />
            <span className="text-yellow-300">{slides[currentSlide].highlight}</span>
          </h1>

          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            {slides[currentSlide].description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition shadow-lg">
            Đăng ký ngay
          </button>
          <button className="px-8 py-3 bg-white/20 backdrop-blur-md text-white font-bold rounded-full border border-white/30 hover:bg-white/30 transition">
            Tìm hiểu thêm
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold mb-1">500+</div>
            <div className="text-sm">Học viên</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold mb-1">50+</div>
            <div className="text-sm">Giáo viên</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-300 mb-1">4.9★</div>
            <div className="text-sm">Đánh giá</div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex gap-2 justify-center mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </Box>
  );
};

export default HomeHero;
