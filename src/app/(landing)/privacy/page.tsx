import { Shield, Eye, Lock, Database, Users, Mail } from "lucide-react";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            content: [
                "Account information (email, name, profile details)",
                "Project data (documents, canvases, and related content)",
                "Usage analytics and performance metrics",
                "Device and browser information",
                "Communication records when you contact us"
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: [
                "Provide and improve our services",
                "Authenticate and secure your account",
                "Send important service updates and notifications",
                "Analyze usage patterns to enhance user experience",
                "Respond to support requests and communications"
            ]
        },
        {
            icon: Shield,
            title: "Data Protection",
            content: [
                "Industry-standard encryption for data in transit and at rest",
                "Regular security audits and vulnerability assessments",
                "Access controls and authentication mechanisms",
                "Secure data centers with physical and digital safeguards",
                "Employee training on data protection best practices"
            ]
        },
        {
            icon: Users,
            title: "Information Sharing",
            content: [
                "We do not sell your personal information to third parties",
                "Data may be shared with trusted service providers under strict agreements",
                "Legal compliance may require disclosure in specific circumstances",
                "Anonymous, aggregated data may be used for research and analytics",
                "You control sharing through our collaboration features"
            ]
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-bitcount-heading">
                        Privacy Policy
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
                        Your privacy is fundamental to how we build and operate SketchFlow.
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
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Our Commitment to Privacy</h2>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-muted-foreground leading-relaxed">
                                At SketchFlow, we believe privacy is a fundamental right. This policy explains how we collect,
                                use, and protect your information when you use our visual collaboration platform. We're committed
                                to transparency and giving you control over your data.
                            </p>
                        </div>
                    </div>

                    {/* Privacy Sections */}
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

                    {/* Your Rights */}
                    <div className="mt-16 p-8 bg-muted/30 rounded-lg">
                        <h3 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
                            <Lock className="w-6 h-6 text-primary" />
                            Your Rights and Controls
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Access and Portability</h4>
                                <p className="text-sm text-muted-foreground">
                                    Request a copy of your data or export your projects at any time.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Correction and Updates</h4>
                                <p className="text-sm text-muted-foreground">
                                    Update your account information and project data directly in the app.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Deletion</h4>
                                <p className="text-sm text-muted-foreground">
                                    Delete your account and associated data permanently from your settings.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Opt-out</h4>
                                <p className="text-sm text-muted-foreground">
                                    Control marketing communications and data processing preferences.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="mt-16 text-center p-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold tracking-tight mb-4">Questions About Privacy?</h3>
                        <p className="text-muted-foreground mb-6">
                            We're here to help you understand how we protect your data and respect your privacy.
                        </p>
                        <a
                            href="mailto:privacy@sketchflow.space"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                        >
                            <Mail className="w-4 h-4" />
                            Contact Privacy Team
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}