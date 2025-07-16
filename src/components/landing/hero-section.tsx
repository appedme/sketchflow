import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LANDING_CONTENT } from "@/constants/landing";
import Link from "next/link";
import { Announcement } from "./announcement";
import { HyperText } from "../magicui/hyper-text";
import { InteractiveHoverButton } from "../magicui/interactive-hover-button";

export function HeroSection() {
  const { hero } = LANDING_CONTENT;

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Announcement Badge */}
        <div className="flex justify-center">
        <Announcement text={hero.announcement} />
        </div>

        {/* Brand and Hero Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight hero-text">
              <HyperText>SketchFlow</HyperText>
            </h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {hero.badge}
            </Badge>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight hero-text">
              {hero.title}
            </h2>
            <h3 className="text-xl md:text-2xl font-medium text-muted-foreground">
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