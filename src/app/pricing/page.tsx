import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals and small projects",
    popular: false,
    features: [
      { name: "Up to 33 projects", included: true },
      { name: "Basic diagram tools", included: true },
      { name: "Export to PNG/PDF", included: true },
      { name: "Community support", included: true },
      { name: "Real-time collaboration", included: false },
      { name: "Advanced templates", included: false },
      { name: "Priority support", included: false },
      { name: "Custom branding", included: false },
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "Ideal for professionals and growing teams",
    popular: true,
    features: [
      { name: "Unlimited projects", included: true },
      { name: "Advanced diagram tools", included: true },
      { name: "Export to multiple formats", included: true },
      { name: "Real-time collaboration", included: true },
      { name: "Advanced templates", included: true },
      { name: "Priority email support", included: true },
      { name: "Version history", included: true },
      { name: "Custom branding", included: false },
    ],
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
  },
  {
    name: "Team",
    price: "$24",
    period: "per month",
    description: "Built for teams that need advanced collaboration",
    popular: false,
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Team management", included: true },
      { name: "Advanced permissions", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
      { name: "SSO integration", included: true },
      { name: "Priority phone support", included: true },
      { name: "Custom integrations", included: true },
    ],
    cta: "Start Team Trial",
    ctaVariant: "outline" as const,
  },
];

const faqs = [
  {
    question: "Can I change my plan at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial for both Pro and Team plans. No credit card required."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes, we offer a 20% discount when you choose annual billing for Pro and Team plans."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade security measures including encryption at rest and in transit, regular backups, and SOC 2 compliance."
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight hero-text mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your visual collaboration needs. Start free and scale as you grow.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No setup fees
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/join" className="block">
                    <Button 
                      variant={plan.ctaVariant} 
                      className="w-full"
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enterprise Section */}
          <div className="bg-muted/50 rounded-lg p-8 mb-20">
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold mb-4">Need something more?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                For large organizations with specific requirements, we offer custom enterprise solutions 
                with dedicated support, advanced security, and tailored integrations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
                <Button size="lg">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-4">
              Ready to start your visual collaboration journey?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of teams already using SketchFlow to bring their ideas to life.
            </p>
            <Link href="/join">
              <Button size="lg">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}