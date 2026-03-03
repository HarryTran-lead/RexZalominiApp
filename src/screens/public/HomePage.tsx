import React from "react";
import { Page } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import HomeHero from "@/components/home/Hero";
import HomeRoadmap from "@/components/home/Roadmap";
import HomeWhyUs from "@/components/home/WhyUs";
import HomeCourses from "@/components/home/Courses";
import HomePrograms from "@/components/home/Programs";
import HomeTestimonials from "@/components/home/Testimonials";
import HomeGallery from "@/components/home/Gallery";
import HomeTeacher from "@/components/home/Teacher";
import HomeBlog from "@/components/home/Blog";
import BottomNavigation from "@/navigation/BottomNavigation";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Page className="bg-white pb-20">
      {/* Floating login button */}
      <button
        onClick={() => navigate("/login")}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-2"
        style={{
          animation: "slideInRight 0.5s ease-out"
        }}
      >
        <span>🔐</span>
        <span className="text-sm">Đăng nhập</span>
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <HomeHero />
      <HomeRoadmap />
      <HomeWhyUs />
      <HomeCourses />
      <HomeTestimonials />
      <HomeGallery />
      <HomeTeacher />
      <HomePrograms />
      <HomeBlog />
      
      <BottomNavigation />
    </Page>
  );
};

export default HomePage;
