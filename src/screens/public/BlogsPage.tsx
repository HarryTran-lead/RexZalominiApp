import React from "react";
import { Page } from "zmp-ui";
import BlogBanner from "@/components/blog/Banner";
import BlogList from "@/components/blog/BlogList";
import BottomNavigation from "@/navigation/BottomNavigation";

const BlogsPage: React.FC = () => {
  return (
    <Page className="bg-white pb-20">
      <BlogBanner />
      <BlogList />
      <BottomNavigation />
    </Page>
  );
};

export default BlogsPage;
