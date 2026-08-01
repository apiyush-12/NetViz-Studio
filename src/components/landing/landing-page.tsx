"use client";

import React from "react";
import { AnnouncementBanner } from "./announcement-banner";
import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import { ValueProposition } from "./value-proposition";
import { FeatureShowcase } from "./feature-showcase";
import { ProtocolShowcase } from "./protocol-showcase";
import { CidrShowcase } from "./cidr-showcase";
import { TopologyShowcase } from "./topology-showcase";
import { LabsShowcase } from "./labs-showcase";
import { HowItWorks } from "./how-it-works";
import { LearningWorkflow } from "./learning-workflow";
import { AuthenticationBenefits } from "./authentication-benefits";
import { DashboardPreview } from "./dashboard-preview";
import { AudienceSection } from "./audience-section";
import { CapabilitiesGrid } from "./capabilities-grid";
import { EducationalAccuracy } from "./educational-accuracy";
import { FaqSection } from "./faq-section";
import { FinalCta } from "./final-cta";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      {/* 1. Announcement Banner */}
      <AnnouncementBanner />

      {/* 2. Navigation Header */}
      <LandingHeader />

      <main className="flex-1">
        {/* 3, 4, 5. Hero Section with Interactive Demo & Background Visuals */}
        <HeroSection />

        {/* 6. Value Proposition */}
        <ValueProposition />

        {/* 7. Core Feature Showcase */}
        <FeatureShowcase />

        {/* 8. Protocol Visualization Showcase */}
        <ProtocolShowcase />

        {/* 9. CIDR & Subnetting Showcase */}
        <CidrShowcase />

        {/* 10. Topology Builder Showcase */}
        <TopologyShowcase />

        {/* 11. Interactive Labs Showcase */}
        <LabsShowcase />

        {/* 12. How It Works Workflow */}
        <HowItWorks />

        {/* 13. Learning Workflow Progression */}
        <LearningWorkflow />

        {/* 14. Authentication & Account Benefits */}
        <AuthenticationBenefits />

        {/* 15. Dashboard Preview */}
        <DashboardPreview />

        {/* 16. Audience Section */}
        <AudienceSection />

        {/* 17. Capabilities Grid */}
        <CapabilitiesGrid />

        {/* 18. Educational Accuracy & Philosophy */}
        <EducationalAccuracy />

        {/* 19. Frequently Asked Questions Accordion */}
        <FaqSection />

        {/* 20. Final Call-To-Action */}
        <FinalCta />
      </main>

      {/* 21. Professional Footer */}
      <LandingFooter />
    </div>
  );
}
