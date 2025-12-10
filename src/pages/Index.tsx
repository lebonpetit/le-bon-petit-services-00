import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <HowItWorks />
      <CTASection />
    </Layout>
  );
};

export default Index;
