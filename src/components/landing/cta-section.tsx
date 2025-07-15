import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-6">
          Ready to Transform Your Ideas?
        </h2>
        <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are already building amazing visual projects with SketchFlow.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
              Start Creating for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Talk to Sales
            </Button>
          </Link>
        </div>
        
        <p className="text-sm opacity-75 mt-6">
          No credit card required • Free forever plan available
        </p>
      </div>
    </section>
  );
}