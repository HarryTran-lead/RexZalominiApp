import React from "react";
import { Box } from "zmp-ui";

const courses = [
  {
    title: "Starters",
    level: "Sơ cấp",
    duration: "6 tháng",
    color: "bg-green-500",
  },
  {
    title: "Movers",
    level: "Trung cấp",
    duration: "8 tháng",
    color: "bg-blue-500",
  },
  {
    title: "Flyers",
    level: "Nâng cao",
    duration: "10 tháng",
    color: "bg-purple-500",
  },
];

const HomeCourses: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Các khóa <span className="text-blue-600">Học</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Lộ trình học từ cơ bản đến nâng cao
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className={`${course.color} p-6 text-white text-center`}>
                <h3 className="text-2xl font-bold">{course.title}</h3>
                <p className="text-sm mt-1 opacity-90">{course.level}</p>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Thời lượng:</span>
                  <span className="font-bold text-blue-600">{course.duration}</span>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomeCourses;
