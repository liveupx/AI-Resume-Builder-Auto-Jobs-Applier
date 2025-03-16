import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const tiers = [
  {
    name: "Free",
    price: "$0",
    features: [
      "Basic resume templates",
      "Job search",
      "Limited applications",
      "Basic AI suggestions",
    ],
    buttonText: "Start Free",
    popular: false,
  },
  {
    name: "Basic",
    price: "$2",
    features: [
      "All free features",
      "Premium templates",
      "Unlimited applications",
      "Enhanced AI suggestions",
      "Priority support",
    ],
    buttonText: "Subscribe",
    popular: true,
  },
  {
    name: "Premium",
    price: "$20",
    features: [
      "All basic features",
      "Custom templates",
      "Advanced AI features",
      "Personal career coach",
      "Interview preparation",
      "Priority job matching",
    ],
    buttonText: "Subscribe",
    popular: false,
  },
];

export default function PricingTiers() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handleSubscribe = (tier: string) => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/subscribe");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={`relative ${
            tier.popular
              ? "border-primary shadow-lg scale-105"
              : "border-border"
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                Most Popular
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{tier.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleSubscribe(tier.name.toLowerCase())}
              className="w-full"
              variant={tier.popular ? "default" : "outline"}
            >
              {tier.buttonText}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
