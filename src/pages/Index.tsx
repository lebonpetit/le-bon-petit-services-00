import { Layout } from "@/components/Layout";
// import { HeroBookingWizard } from "@/components/HeroBookingWizard";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      {/* <HeroBookingWizard /> */}
      <ServicesSection />
      <HowItWorks />
      <CTASection />
    </Layout>
  );
};

export default Index;
