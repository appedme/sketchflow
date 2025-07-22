'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LANDING_CONTENT } from "@/constants/landing";
import Link from "next/link";
import { Announcement } from "./announcement";
import { HyperText } from "../magicui/hyper-text";
import { InteractiveHoverButton } from "../magicui/interactive-hover-button";
import { Playfair_Display } from 'next/font/google';
import { useState, useEffect, useRef } from 'react';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Import Bitcount Prop Single font
const bitcountPropSingle = {
  className: 'font-bitcount',
};

export function HeroSection() {
  const { hero } = LANDING_CONTENT;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videos = [
    "/bg1.mp4",
    "/bg2.mp4"
  ];

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  // Force video to play on component mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [currentVideoIndex]);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center overflow-hidden">
      {/* Background Video Playlist */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          onLoadedData={() => videoRef.current?.play()}
        >
          <source src={videos[currentVideoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
        {/* Announcement Badge */}
        <div className="flex justify-center">
          <Announcement text={hero.announcement} />
        </div>

        {/* Brand and Hero Content */}
        <div className="space-y-6 text-white">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight hero-text">
              <HyperText>SketchFlow</HyperText>
            </h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {hero.badge}
            </Badge>
          </div>

          <div className="space-y-3">
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight hero-text ${bitcountPropSingle.className}`}>
              {hero.title}
            </h2>
            <h3 className={`text-xl md:text-2xl font-medium text-muted-foreground italic ${playfair.className}`}>
              {hero.subtitle}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {hero.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Link href={hero.cta.primary_link} >
            <InteractiveHoverButton className="px-8 py-3 text-base font-semibold">
              {hero.cta.primary}
            </InteractiveHoverButton>
          </Link>
          {/* <Link href={hero.cta.secondary_link} >
            <Button variant="outline" size="lg" className="px-8 py-3 text-base font-semibold">
              {hero.cta.secondary}
            </Button>
          </Link> */}
        </div>
      </div>
    </section>
  );
}