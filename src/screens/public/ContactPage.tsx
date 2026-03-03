import React from "react";
import { Page } from "zmp-ui";
import ContactBanner from "@/components/contact/Banner";
import ContactForm from "@/components/contact/ContactForm";
import BottomNavigation from "@/navigation/BottomNavigation";

const ContactPage: React.FC = () => {
  return (
    <Page className="bg-white pb-20">
      <ContactBanner />
      <ContactForm />
      <BottomNavigation />
    </Page>
  );
};

export default ContactPage;
