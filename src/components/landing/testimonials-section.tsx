import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      company: "TechCorp",
      avatar: "/avatars/sarah.jpg",
      content: "SketchFlow has revolutionized how our team collaborates on design projects. The seamless integration between diagramming and documentation is a game-changer.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Architect",
      company: "DevStudio",
      avatar: "/avatars/marcus.jpg",
      content: "Finally, a tool that understands developers. Creating system diagrams and keeping documentation in sync has never been easier.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Project Manager",
      company: "InnovateLab",
      avatar: "/avatars/emily.jpg",
      content: "The project organization features are outstanding. We've reduced our planning time by 50% since switching to SketchFlow.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from the creators who use SketchFlow every day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center justify-center space-x-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}