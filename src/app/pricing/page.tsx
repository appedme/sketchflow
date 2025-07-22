"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown, 
  Rocket, 
  Users, 
  Building, 
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Infinity,
  Heart,
  Gift,
  TrendingUp,
  Award,
  Globe,
  Lock
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    originalPrice: null,
    period: "forever",
    description: "Perfect for individuals and small projects",
    popular: false,
    icon: Heart,
    color: "from-gray-500 to-gray-600",
    features: [
      { name: "Up to 3 projects", included: true, highlight: false },
      { name: "Basic diagram tools", included: true, highlight: false },
      { name: "Export to PNG/PDF", included: true, highlight: false },
      { name: "Community support", included: true, highlight: false },
      { name: "1GB storage", included: true, highlight: false },
      { name: "Real-time collaboration", included: false, highlight: false },
      { name: "Advanced templates", included: false, highlight: false },
      { name: "Priority support", included: false, highlight: false },
      { name: "Custom branding", included: false, highlight: false },
      { name: "API access", included: false, highlight: false },
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    limits: {
      projects: 3,
      collaborators: 1,
      storage: "1GB",
      exports: "Unlimited"
    }
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    originalPrice: 24,
    period: "month",
    description: "For professionals and growing teams",
    popular: true,
    icon: Zap,
    color: "from-blue-500 to-purple-600",
    features: [
      { name: "Unlimited projects", included: true, highlight: true },
      { name: "Advanced diagram tools", included: true, highlight: true },
      { name: "All export formats", included: true, highlight: false },
      { name: "Priority support", included: true, highlight: false },
      { name: "Real-time collaboration", included: true, highlight: true },
      { name: "Advanced templates", included: true, highlight: true },
      { name: "Version history", included: true, highlight: false },
      { name: "Custom branding", included: true, highlight: false },
      { name: "50GB storage", included: true, highlight: false },
      { name: "API access", included: false, highlight: false },
    ],
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
    limits: {
      projects: "Unlimited",
      collaborators: 10,
      storage: "50GB",
      exports: "Unlimited"
    }
  },
  {
    id: "team",
    name: "Team",
    price: 24,
    originalPrice: 48,
    period: "month",
    description: "For teams that need advanced collaboration",
    popular: false,
    icon: Users,
    color: "from-green-500 to-teal-600",
    features: [
      { name: "Everything in Pro", included: true, highlight: false },
      { name: "Unlimited collaborators", included: true, highlight: true },
      { name: "Team management", included: true, highlight: true },
      { name: "Advanced permissions", included: true, highlight: false },
      { name: "SSO integration", included: true, highlight: false },
      { name: "Audit logs", included: true, highlight: false },
      { name: "200GB storage", included: true, highlight: false },
      { name: "API access", included: true, highlight: true },
      { name: "Custom integrations", included: true, highlight: false },
      { name: "Dedicated support", included: true, highlight: false },
    ],
    cta: "Start Team Trial",
    ctaVariant: "default" as const,
    limits: {
      projects: "Unlimited",
      collaborators: "Unlimited",
      storage: "200GB",
      exports: "Unlimited"
    }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    originalPrice: null,
    period: "custom",
    description: "For large organizations with custom needs",
    popular: false,
    icon: Building,
    color: "from-purple-500 to-pink-600",
    features: [
      { name: "Everything in Team", included: true, highlight: false },
      { name: "Custom deployment", included: true, highlight: true },
      { name: "Advanced security", included: true, highlight: true },
      { name: "Custom integrations", included: true, highlight: false },
      { name: "Dedicated account manager", included: true, highlight: false },
      { name: "SLA guarantee", included: true, highlight: false },
      { name: "Unlimited storage", included: true, highlight: true },
      { name: "White-label solution", included: true, highlight: false },
      { name: "Custom training", included: true, highlight: false },
      { name: "24/7 phone support", included: true, highlight: false },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    limits: {
      projects: "Unlimited",
      collaborators: "Unlimited",
      storage: "Unlimited",
      exports: "Unlimited"
    }
  }
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start."
  },
  {
    question: "Can I change plans anytime?",
    answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
  },
  {
    question: "Is my data secure?",
    answer: "Yes! We use enterprise-grade encryption and security measures to protect your data. SOC 2 Type II certified."
  },
  {
    question: "Do you offer discounts for students or nonprofits?",
    answer: "Yes! We offer 50% discounts for students and nonprofits. Contact us for verification."
  },
  {
    question: "What happens if I exceed my limits?",
    answer: "We'll notify you before you hit limits. You can upgrade anytime or we'll help you optimize usage."
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Design Lead",
    company: "TechCorp",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content: "The Pro plan has everything our design team needs. The collaboration features are game-changing.",
    plan: "Pro"
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO",
    company: "StartupXYZ",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "Enterprise plan gives us the security and control we need for our sensitive projects.",
    plan: "Enterprise"
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const getPrice = (plan: typeof pricingPlans[0]) => {
    if (!plan.price) return "Custom";
    const price = isAnnual ? plan.price * 10 : plan.price; // 2 months free on annual
    return `$${price}`;
  };

  const getSavings = (plan: typeof pricingPlans[0]) => {
    if (!plan.price || !plan.originalPrice) return null;
    const currentPrice = isAnnual ? plan.price * 10 : plan.price;
    const originalPrice = isAnnual ? plan.originalPrice * 10 : plan.originalPrice;
    const savings = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    return savings;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <Badge variant="secondary" className="text-sm font-medium">
                🎉 Early Bird Pricing - Save up to 50%
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the perfect plan for your needs. Start free, upgrade when you're ready. 
              All plans include our core features with no hidden fees.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn("text-sm font-medium", !isAnnual && "text-primary")}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span className={cn("text-sm font-medium", isAnnual && "text-primary")}>
                Annual
              </span>
              <Badge variant="secondary" className="ml-2">
                Save 2 months
              </Badge>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {pricingPlans.map((plan, index) => {
              const IconComponent = plan.icon;
              const savings = getSavings(plan);
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={cn(
                    "relative h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2",
                    plan.popular 
                      ? "border-primary/50 bg-gradient-to-br from-primary/5 to-blue-500/5 shadow-xl" 
                      : "border-border hover:border-primary/30",
                    selectedPlan === plan.id && "ring-2 ring-primary/20"
                  )}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4">
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r",
                          plan.color
                        )}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                      
                      <div className="mt-4">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl font-bold">
                            {getPrice(plan)}
                          </span>
                          {plan.price && (
                            <span className="text-muted-foreground">
                              /{isAnnual ? "year" : plan.period}
                            </span>
                          )}
                        </div>
                        
                        {savings && (
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground line-through">
                              ${isAnnual ? plan.originalPrice! * 10 : plan.originalPrice}
                            </span>
                            <Badge variant="secondary" className="ml-2 text-green-600">
                              Save {savings}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Button 
                        className={cn(
                          "w-full mb-6",
                          plan.popular && "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                        )}
                        variant={plan.ctaVariant}
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      
                      {/* Plan Limits */}
                      <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm font-semibold">{plan.limits.projects}</div>
                          <div className="text-xs text-muted-foreground">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{plan.limits.collaborators}</div>
                          <div className="text-xs text-muted-foreground">Collaborators</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{plan.limits.storage}</div>
                          <div className="text-xs text-muted-foreground">Storage</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{plan.limits.exports}</div>
                          <div className="text-xs text-muted-foreground">Exports</div>
                        </div>
                      </div>
                      
                      {/* Features List */}
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3">
                            {feature.included ? (
                              <Check className={cn(
                                "w-4 h-4 flex-shrink-0",
                                feature.highlight ? "text-primary" : "text-green-500"
                              )} />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={cn(
                              "text-sm",
                              !feature.included && "text-muted-foreground",
                              feature.highlight && "font-semibold text-primary"
                            )}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span className="text-sm">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Compare All Features</h2>
            <p className="text-xl text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full bg-background rounded-lg shadow-lg">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-6 font-semibold">Features</th>
                  {pricingPlans.map(plan => (
                    <th key={plan.id} className="text-center p-6 font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingPlans[0].features.map((_, featureIndex) => (
                  <tr key={featureIndex} className="border-b hover:bg-muted/20">
                    <td className="p-6 font-medium">
                      {pricingPlans[0].features[featureIndex].name}
                    </td>
                    {pricingPlans.map(plan => (
                      <td key={plan.id} className="text-center p-6">
                        {plan.features[featureIndex]?.included ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">
              Real feedback from teams using SketchFlow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {testimonial.plan}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground italic">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of creators who've transformed their workflow with SketchFlow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}