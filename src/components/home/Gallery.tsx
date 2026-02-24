import React from "react";
import { Box } from "zmp-ui";

const gallery = [
  "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Classroom+1",
  "https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Activity",
  "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Library",
  "https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Playground",
];

const HomeGallery: React.FC = () => {
  return (
    <Box className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Thư viện <span className="text-blue-600">Hình ảnh</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Môi trường học tập hiện đại và thân thiện
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gallery.map((image, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default HomeGallery;
