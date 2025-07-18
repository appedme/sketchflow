import { 
  Navigation,
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  UseCasesSection,
  TestimonialsSection,
  IntegrationSection,
  CTASection,
  Footer 
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <TestimonialsSection />
        <IntegrationSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
