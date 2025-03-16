import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { MoveRight } from "lucide-react";

export default function HeroSection() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div className="relative min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Career Success Platform
          </h1>
          <p className="text-xl mb-8 text-gray-200">
            Create professional resumes, apply to jobs, and advance your career with our intelligent job portal. Let AI help you stand out from the crowd.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => navigate(user ? "/resume-builder" : "/auth")}
              className="group"
            >
              Build Your Resume
              <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              Browse Jobs
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-8">
            {[
              "10,000+ Professionals",
              "AI-Powered Tools",
              "500+ Companies",
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-sm uppercase tracking-wider text-gray-300">
                  {stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
