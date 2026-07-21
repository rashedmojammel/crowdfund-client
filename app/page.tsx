import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedHero } from "@/components/home/AnimatedHero";
import { TopFundedCampaigns } from "@/components/home/TopFundedCampaigns";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ExploreByCategory } from "@/components/home/ExploreByCategory";
import { PlatformImpact } from "@/components/home/PlatformImpact";
import { Testimonials } from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* Section rhythm: 48px mobile / 64px tablet / 96px desktop (CLAUDE.md). */}
      <main className="flex grow flex-col gap-12 pb-12 md:gap-16 md:pb-16 lg:gap-24 lg:pb-24">
        <AnimatedHero />
        <TopFundedCampaigns />
        <HowItWorks />
        <ExploreByCategory />
        <PlatformImpact />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
