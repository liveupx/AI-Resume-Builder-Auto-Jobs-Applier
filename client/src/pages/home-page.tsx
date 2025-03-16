import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import HeroSection from "@/components/landing/hero-section";
import { Card, CardContent } from "@/components/ui/card";
import PricingTiers from "@/components/pricing-tiers";
import ReviewsSection from "@/components/landing/reviews-section";
import { MoveRight, Briefcase, FileText, Brain, CheckCircle } from "lucide-react";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI-Powered Resume Builder",
      description: "Create professional resumes with AI assistance for optimal content and formatting.",
    },
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "Smart Job Matching",
      description: "Get matched with relevant jobs based on your skills and experience.",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Multiple Templates",
      description: "Choose from a variety of professional resume templates.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Automated Applications",
      description: "Apply to multiple jobs with a single click using your tailored resume.",
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features to Advance Your Career
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-8">
              {[
                "Create your professional profile",
                "Build your resume with AI assistance",
                "Apply to matched jobs instantly",
                "Track your applications",
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="text-lg">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Choose Your Plan
          </h2>
          <PricingTiers />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Take Your Career to the Next Level?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of professionals who have already advanced their careers with our platform.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="group"
          >
            Get Started Now
            <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
    </div>
  );
}