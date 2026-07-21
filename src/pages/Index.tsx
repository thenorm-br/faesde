import Header from "@/components/Header.tsx";
import HeroBanner from "@/components/HeroBanner.tsx";
import BenefitsBar from "@/components/BenefitsBar.tsx";
import CoursesSection from "@/components/CoursesSection.tsx";
import TestimonialsSection from "@/components/TestimonialsSection.tsx";
import ContactSection from "@/components/ContactSection.tsx";
import Footer from "@/components/Footer.tsx";
import WhatsAppButton from "@/components/WhatsAppButton.tsx";
import ExitIntentPopup from "@/components/ExitIntentPopup.tsx";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <BenefitsBar />
        <CoursesSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
