import Stripe from "stripe";
import { storage } from "./storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const SUBSCRIPTION_TIERS = {
  basic: {
    price: "price_basic", // Replace with actual Stripe price IDs
    features: ["Basic resume templates", "AI content suggestions"],
  },
  pro: {
    price: "price_pro",
    features: ["All templates", "Advanced AI features", "Priority support"],
  },
  premium: {
    price: "price_premium",
    features: ["All features", "Unlimited AI generations", "24/7 priority support"],
  }
};

export async function createSubscription(userId: number, tier: "basic" | "pro" | "premium") {
  const user = await storage.getUser(userId);
  if (!user) throw new Error("User not found");

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
    });

    await storage.updateStripeCustomerId(userId, customer.id);
    user.stripeCustomerId = customer.id;
  }

  const subscription = await stripe.subscriptions.create({
    customer: user.stripeCustomerId,
    items: [{ price: SUBSCRIPTION_TIERS[tier].price }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });

  await storage.updateUserStripeInfo(userId, {
    stripeSubscriptionId: subscription.id,
    subscriptionTier: tier,
  });

  return {
    subscriptionId: subscription.id,
    clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
  };
}

export async function cancelSubscription(userId: number) {
  const user = await storage.getUser(userId);
  if (!user || !user.stripeSubscriptionId) {
    throw new Error("No active subscription found");
  }

  await stripe.subscriptions.cancel(user.stripeSubscriptionId);
  await storage.updateUserStripeInfo(userId, {
    stripeSubscriptionId: null,
    subscriptionTier: "free",
  });
}