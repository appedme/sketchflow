'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

// TypeScript declaration for Twitter widgets
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
      };
    };
  }
}

export function TestimonialsSection() {
  // Load Twitter widgets script
  useEffect(() => {
    // Check if Twitter widgets script is already loaded
    if (document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      // If script exists, just reload widgets
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;

    script.onload = () => {
      // Ensure widgets are loaded after script loads
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    };

    document.body.appendChild(script);
  }, []);



  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <Badge variant="secondary" className="text-sm font-medium">
              Real feedback from our community
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-bitcount-heading">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            See what developers and creators are saying about SketchFlow on social media
          </p>
        </motion.div>

        {/* Twitter Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Tweet 1 - @sarvagya_kul */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Card className="border-primary/10 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm shadow-lg overflow-hidden">
                <CardContent className="p-4">
                  <blockquote className="twitter-tweet" data-theme="dark" data-width="400" data-dnt="true">
                    <p lang="en" dir="ltr">
                      <a href="https://x.com/sarvagya_kul/status/1947960911832162360?ref_src=twsrc%5Etfw">
                        View this tweet from @sarvagya_kul
                      </a>
                    </p>
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tweet 2 - @SH20RAJ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Card className="border-primary/10 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm shadow-lg overflow-hidden">
                <CardContent className="p-4">
                  <blockquote className="twitter-tweet" data-theme="dark" data-width="400" data-dnt="true">
                    <p lang="en" dir="ltr">
                      <a href="https://x.com/SH20RAJ/status/1947957536659054848?ref_src=twsrc%5Etfw">
                        View this tweet from @SH20RAJ
                      </a>
                    </p>
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-6">
            Join thousands of creators who've transformed their workflow
          </p>
          <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
            Start Your Free Trial
          </Button>
        </motion.div>
      </div>
    </section>
  );
}