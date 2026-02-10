import { Layout } from "@/components/Layout";
import { HeroBookingWizard } from "@/components/HeroWizard.tsx";
import { ServicesSection } from "@/components/ServicesSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CTASection } from "@/components/CTASection";
import { PersonalBrandingSection } from "@/components/PersonalBrandingSection";

const Index = () => {
  return (
    <Layout>
      <HeroBookingWizard />
      {/* <HeroSection /> */}
      <ServicesSection />
      <HowItWorks />
      <CTASection />
      <PersonalBrandingSection />
    </Layout>
  );
};

export default Index;
