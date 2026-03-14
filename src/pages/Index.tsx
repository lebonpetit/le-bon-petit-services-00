import { Layout } from "@/components/Layout";
import { HeroSlider } from "@/components/HeroSlider";
import { ServicesSection } from "@/components/ServicesSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSlider />
      <ServicesSection />
      <HowItWorks />
      <CTASection />
    </Layout>
  );
};

export default Index;
