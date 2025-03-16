import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingTiers from "@/components/pricing-tiers";
import { ArrowLeft } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing STRIPE_PUBLIC_KEY environment variable");
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function SubscribePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select a subscription plan to access premium features
        </p>
      </div>

      <Tabs defaultValue="monthly" className="space-y-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Billing (Save 20%)</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <PricingTiers period="monthly" />
        </TabsContent>

        <TabsContent value="yearly">
          <PricingTiers period="yearly" />
        </TabsContent>
      </Tabs>
    </div>
  );
}