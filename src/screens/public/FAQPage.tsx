import React from "react";
import { Page } from "zmp-ui";
import FAQBanner from "@/components/faq/Banner";
import FAQList from "@/components/faq/FAQList";
import BottomNavigation from "@/navigation/BottomNavigation";

const FAQPage: React.FC = () => {
  return (
    <Page className="bg-white pb-20">
      <FAQBanner />
      <FAQList />
      <BottomNavigation />
    </Page>
  );
};

export default FAQPage;
