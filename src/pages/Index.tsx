import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import BenefitsBar from "@/components/BenefitsBar";
import CoursesSection from "@/components/CoursesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

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
    </div>
  );
};

export default Index;
