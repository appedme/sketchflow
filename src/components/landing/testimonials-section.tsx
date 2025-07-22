'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      company: "TechCorp",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "SketchFlow has revolutionized how our team collaborates on design projects. The seamless integration between diagramming and documentation is a game-changer.",
      rating: 5,
      highlight: "Revolutionized collaboration",
      metrics: "3x faster design iterations"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Architect",
      company: "DevStudio",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Finally, a tool that understands developers. Creating system diagrams and keeping documentation in sync has never been easier.",
      rating: 5,
      highlight: "Developer-friendly",
      metrics: "90% documentation accuracy"
    },
    {
      name: "Emily Watson",
      role: "Project Manager",
      company: "InnovateLab",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "The project organization features are outstanding. We've reduced our planning time by 50% since switching to SketchFlow.",
      rating: 5,
      highlight: "Outstanding organization",
      metrics: "50% faster planning"
    },
    {
      name: "David Kim",
      role: "UX Director",
      company: "DesignFlow",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "The real-time collaboration features have transformed how our distributed team works together. It's like having everyone in the same room.",
      rating: 5,
      highlight: "Real-time collaboration",
      metrics: "100% remote team sync"
    },
    {
      name: "Lisa Thompson",
      role: "Technical Writer",
      company: "DocuTech",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      content: "Creating beautiful documentation alongside visual diagrams has never been this intuitive. Our documentation quality has improved dramatically.",
      rating: 5,
      highlight: "Intuitive documentation",
      metrics: "200% better docs quality"
    },
    {
      name: "Alex Johnson",
      role: "Startup Founder",
      company: "InnovateCo",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      content: "As a startup, we needed something powerful yet affordable. SketchFlow gives us enterprise-level features without the enterprise price tag.",
      rating: 5,
      highlight: "Enterprise features, startup price",
      metrics: "80% cost savings"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

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
              Loved by 10,000+ creators
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it - hear from the creators, designers, and teams who use SketchFlow to bring their ideas to life every day
          </p>
        </motion.div>

        {/* Featured Testimonial Carousel */}
        <div className="mb-16">
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative"
              >
                <Card className="border-2 border-primary/10 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Quote Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <Quote className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex justify-center md:justify-start mb-4">
                          {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        
                        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6 text-foreground/90">
                          "{testimonials[currentIndex].content}"
                        </blockquote>
                        
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-primary/20">
                              <AvatarImage 
                                src={testimonials[currentIndex].avatar} 
                                alt={testimonials[currentIndex].name} 
                              />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-lg">{testimonials[currentIndex].name}</div>
                              <div className="text-muted-foreground">
                                {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Badge variant="outline" className="bg-primary/5 border-primary/20">
                              {testimonials[currentIndex].highlight}
                            </Badge>
                            <Badge variant="secondary">
                              {testimonials[currentIndex].metrics}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              {/* Dots Indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid of All Testimonials */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20 cursor-pointer ${
                index === currentIndex ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/30'
              }`}
              onClick={() => goToTestimonial(index)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.metrics}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="text-xs">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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