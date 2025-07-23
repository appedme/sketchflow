import { Mail, Clock, MessageSquare, Users, Bug, Lightbulb } from "lucide-react";
import { FeedbackThread } from "@/components/ui/feedback-thread";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    const contactReasons = [
        {
            icon: MessageSquare,
            title: "General Questions",
            description: "Learn more about SketchFlow's features and capabilities"
        },
        {
            icon: Bug,
            title: "Technical Support",
            description: "Get help with troubleshooting and technical issues"
        },
        {
            icon: Lightbulb,
            title: "Feature Requests",
            description: "Share your ideas for new features and improvements"
        },
        {
            icon: Users,
            title: "Partnership Inquiries",
            description: "Explore collaboration and partnership opportunities"
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-bitcount-heading">
                        Get in Touch
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Have questions, feedback, or need support? We'd love to hear from you and help you make the most of SketchFlow.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" asChild className="px-8 py-4 text-lg font-semibold">
                            <a href="mailto:mail@sketchflow.space">
                                <Mail className="mr-2 w-5 h-5" />
                                Email Us Directly
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="px-8 py-4 text-lg font-semibold">
                            <a href="#contact-form">
                                <MessageSquare className="mr-2 w-5 h-5" />
                                Use Contact Form
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Contact Reasons */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            How Can We Help?
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Whether you're just getting started or need advanced support, we're here for you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {contactReasons.map((reason, index) => (
                            <div key={index} className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <reason.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
                                <p className="text-sm text-muted-foreground">{reason.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight mb-6">
                                    Contact Information
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Mail className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">Email</h3>
                                            <a
                                                href="mailto:mail@sketchflow.space"
                                                className="text-muted-foreground hover:text-primary transition-colors text-lg"
                                            >
                                                mail@sketchflow.space
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Clock className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">Response Time</h3>
                                            <p className="text-muted-foreground">
                                                We typically respond within 24 hours during business days.
                                                For urgent issues, include "URGENT" in your subject line.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Thread */}
                            <div>
                                <FeedbackThread
                                    title="💬 Join the Community Discussion"
                                    description="Connect with other users and share your thoughts on our development roadmap:"
                                    variant="default"
                                />
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div id="contact-form">
                            <h2 className="text-3xl font-bold tracking-tight mb-6">
                                Send us a Message
                            </h2>

                            {/* Tally Form Embed */}
                            <div className="bg-background rounded-lg border overflow-hidden shadow-sm">
                                <iframe
                                    src="https://tally.so/embed/n0qO8y?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                                    width="100%"
                                    height="600"
                                    style={{ border: 0 }}
                                    title="Contact Form"
                                    className="min-h-[600px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                        Don't wait for answers - dive in and start creating with SketchFlow today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" variant="secondary" asChild className="px-8 py-4 text-lg font-semibold">
                            <a href="/dashboard">
                                Start Creating for Free
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="px-8 py-4 text-lg font-semibold border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                            <a href="/pricing">
                                View Pricing
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}