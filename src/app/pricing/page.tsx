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
      { name: "Up to 300 projects", included: true },
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
      { name: "AI Features", included: true },
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
      { name: "On-premise deployment", included: false },
      { name: "On-demand features", included: false },
    ],
    cta: "Start Team Trial",
    ctaVariant: "outline" as const,
  },
];

const faqs = [
  {
    question: "When will paid plans be available?",
    answer: "We plan to introduce paid plans after the beta period ends. Beta users will receive advance notice and special early-bird pricing."
  },
  {
    question: "Will I lose my data when beta ends?",
    answer: "No, all your projects and data will be preserved. You'll be able to continue using the platform seamlessly."
  },
  {
    question: "What happens to my projects during beta?",
    answer: "All projects created during beta are yours to keep. There are no limits on project creation or usage during this period."
  },
  {
    question: "Can I use this for commercial projects?",
    answer: "Yes, you can use SketchFlow for commercial projects during the beta period at no cost."
  },
  {
    question: "How will early-bird pricing work?",
    answer: "Beta users will receive exclusive discounts of up to 50% off regular pricing when paid plans launch."
  },
  {
    question: "Is my data secure during beta?",
    answer: "Absolutely. We use enterprise-grade security measures including encryption at rest and in transit, regular backups, and SOC 2 compliance."
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Public Beta Preview
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Everything is Free During Beta
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            We're currently in public beta! All features are completely free with generous limits. 
            Enjoy unlimited access while we perfect the platform.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 font-medium">
              Beta Special: Unlimited projects, AI features, collaboration, and all premium tools - completely free!
            </p>
          </div>
        </div>

        {/* Current Beta Benefits */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">What You Get Right Now</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              During our public beta, you have access to everything without any restrictions.
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800">Beta Access - Free Forever</CardTitle>
              <CardDescription className="text-green-700">
                Full platform access with no limitations during beta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-800">Core Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Unlimited projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Advanced diagram tools</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Real-time collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>AI-powered features</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-green-800">Premium Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Export to all formats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Advanced templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Version history</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/sign-in">
                    Start Using SketchFlow Free
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Pricing Preview */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Future Pricing Structure</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Here's what our pricing will look like when we exit beta. Current users will get special early-bird pricing!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 opacity-75">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Early Bird Benefits</h3>
              <p className="text-blue-800">
                Beta users will receive exclusive early-bird pricing with up to 50% off when we launch paid plans. 
                Plus, you'll keep all your projects and data with no interruption!
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about our beta program and future pricing.
            </p>
          </div>
          
          <div className="grid gap-6">
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

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of users already creating amazing diagrams and collaborating seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/sign-in">
                  Start Creating for Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}