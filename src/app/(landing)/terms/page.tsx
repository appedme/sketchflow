import { FileText, Scale, Users, Shield, AlertTriangle, Mail } from "lucide-react";

export default function TermsPage() {
    const sections = [
        {
            icon: Users,
            title: "Account and Registration",
            content: [
                "You must be at least 13 years old to use SketchFlow",
                "Provide accurate and complete registration information",
                "Maintain the security of your account credentials",
                "You are responsible for all activities under your account",
                "One person or entity per account unless otherwise agreed"
            ]
        },
        {
            icon: FileText,
            title: "Acceptable Use",
            content: [
                "Use SketchFlow for lawful purposes only",
                "Do not upload malicious, harmful, or inappropriate content",
                "Respect intellectual property rights of others",
                "Do not attempt to disrupt or compromise our services",
                "Follow community guidelines in shared spaces"
            ]
        },
        {
            icon: Shield,
            title: "Intellectual Property",
            content: [
                "You retain ownership of content you create and upload",
                "Grant us necessary licenses to provide our services",
                "SketchFlow owns its platform, features, and technology",
                "Respect third-party licenses and attributions",
                "Report copyright infringement through proper channels"
            ]
        },
        {
            icon: Scale,
            title: "Service Availability",
            content: [
                "We strive for high availability but cannot guarantee 100% uptime",
                "Scheduled maintenance will be communicated in advance",
                "We may modify or discontinue features with reasonable notice",
                "Free tier limitations may apply to storage and usage",
                "Premium features require active subscription"
            ]
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Scale className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-bitcount-heading">
                        Terms of Service
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
                        The rules and guidelines for using SketchFlow's platform and services.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Last updated: January 23, 2025
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Agreement to Terms</h2>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing and using SketchFlow, you agree to be bound by these Terms of Service and all
                                applicable laws and regulations. If you do not agree with any of these terms, you are
                                prohibited from using or accessing this service.
                            </p>
                        </div>
                    </div>

                    {/* Terms Sections */}
                    <div className="space-y-16">
                        {sections.map((section, index) => (
                            <div key={index} className="border-l-4 border-primary/20 pl-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <section.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight">{section.title}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                                            <span className="text-muted-foreground leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Limitation of Liability */}
                    <div className="mt-16 p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <h3 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                            Limitation of Liability
                        </h3>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                SketchFlow is provided "as is" without warranties of any kind. We shall not be liable for any
                                indirect, incidental, special, consequential, or punitive damages resulting from your use of
                                the service.
                            </p>
                            <p>
                                Our total liability to you for any claims arising from these terms or your use of SketchFlow
                                shall not exceed the amount you paid us in the 12 months preceding the claim.
                            </p>
                        </div>
                    </div>

                    {/* Termination */}
                    <div className="mt-16 p-8 bg-muted/30 rounded-lg">
                        <h3 className="text-2xl font-bold tracking-tight mb-6">Termination</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">By You</h4>
                                <p className="text-sm text-muted-foreground">
                                    You may terminate your account at any time through your account settings.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">By Us</h4>
                                <p className="text-sm text-muted-foreground">
                                    We may suspend or terminate accounts that violate these terms.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Effect of Termination</h4>
                                <p className="text-sm text-muted-foreground">
                                    Your right to use SketchFlow will cease immediately upon termination.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Data Retention</h4>
                                <p className="text-sm text-muted-foreground">
                                    We may retain certain information as required by law or for legitimate business purposes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="mt-16 text-center p-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold tracking-tight mb-4">Questions About These Terms?</h3>
                        <p className="text-muted-foreground mb-6">
                            If you have any questions about these Terms of Service, please don't hesitate to contact us.
                        </p>
                        <a
                            href="mailto:legal@sketchflow.space"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                        >
                            <Mail className="w-4 h-4" />
                            Contact Legal Team
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}