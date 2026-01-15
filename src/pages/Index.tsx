import { Layout } from "@/components/Layout";
import { HeroBookingWizard } from "@/components/HeroBookingWizard";
import { ServicesSection } from "@/components/ServicesSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroBookingWizard />
      <ServicesSection />
      <HowItWorks />
      <CTASection />
    </Layout>
  );
};

export default Index;
