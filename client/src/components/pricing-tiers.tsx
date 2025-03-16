import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const tiers = [
  {
    name: "Basic",
    price: "$2",
    description: "Essential resume building tools",
    features: [
      "Basic resume templates",
      "PDF downloads",
      "Basic AI suggestions",
      "Email support",
    ],
    tier: "basic",
  },
  {
    name: "Pro",
    price: "$5",
    description: "Advanced AI-powered features",
    features: [
      "All Basic features",
      "Advanced AI resume enhancement",
      "Multiple resume versions",
      "Priority email support",
      "Automatic job matching",
    ],
    tier: "pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "$20",
    description: "Complete career advancement suite",
    features: [
      "All Pro features",
      "Unlimited AI generations",
      "Custom resume templates",
      "Priority job matching",
      "24/7 priority support",
      "Interview preparation tools",
    ],
    tier: "premium",
  },
];

export default function PricingTiers() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { tier });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (tier: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    subscribeMutation.mutateAsync(tier);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={`relative ${
            tier.popular
              ? "border-primary shadow-lg scale-105 md:-mt-4"
              : "border-border"
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-baseline gap-x-2">
              <span className="text-2xl font-bold">{tier.name}</span>
              <span className="text-3xl font-bold">{tier.price}</span>
              <span className="text-muted-foreground">/month</span>
            </CardTitle>
            <p className="text-muted-foreground">{tier.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={tier.popular ? "default" : "outline"}
              onClick={() => handleSubscribe(tier.tier)}
              disabled={subscribeMutation.isPending}
            >
              {user?.subscriptionTier === tier.tier
                ? "Current Plan"
                : "Subscribe"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
