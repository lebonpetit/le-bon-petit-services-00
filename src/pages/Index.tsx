import { Layout } from "@/components/Layout";
import { HeroBookingWizard } from "@/components/HeroBookingWizard.tsx";
import { ServicesSection } from "@/components/ServicesSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroBookingWizard />
      {/* <HeroSection /> */}
      <ServicesSection />
      <HowItWorks />
      <CTASection />
    </Layout>
  );
};

export default Index;
