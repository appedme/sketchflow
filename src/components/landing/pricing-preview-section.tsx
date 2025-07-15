import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

export function PricingPreviewSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 300 projects",
        "Basic diagramming tools",
        "Community support",
        "Export to PNG/PDF"
      ],
      cta: "Get Started",
      href: "/dashboard",
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "For professional creators",
      features: [
        "Unlimited projects",
        "AI Features",
        "Advanced diagramming tools",
        "Priority support",
        "All export formats",
        "Team collaboration",
        "Custom templates"
      ],
      cta: "Start Free Trial",
      href: "/pricing",
      popular: true
    },
    {
      name: "Team",
      price: "$24",
      period: "per user/month",
      description: "For growing teams",
      features: [
        "Everything in Pro",
        "Advanced team features",
        "Admin dashboard",
        "SSO integration",
        "Custom branding",
        "Dedicated support",

      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="w-full" >
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/pricing" >
            <Button variant="outline" size="lg">
              View Full Pricing Details
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}