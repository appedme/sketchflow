import { Cookie, Settings, BarChart3, Shield, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
    const cookieTypes = [
        {
            icon: Shield,
            title: "Essential Cookies",
            description: "Required for basic site functionality and security",
            examples: [
                "Authentication and session management",
                "Security tokens and CSRF protection",
                "Load balancing and performance optimization",
                "Basic site preferences and settings"
            ],
            required: true
        },
        {
            icon: BarChart3,
            title: "Analytics Cookies",
            description: "Help us understand how you use SketchFlow to improve our service",
            examples: [
                "Page views and user interactions",
                "Feature usage and performance metrics",
                "Error tracking and debugging information",
                "A/B testing and optimization data"
            ],
            required: false
        },
        {
            icon: Settings,
            title: "Functional Cookies",
            description: "Remember your preferences and enhance your experience",
            examples: [
                "Theme and display preferences",
                "Language and region settings",
                "Workspace and project preferences",
                "Notification and communication settings"
            ],
            required: false
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Cookie className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-bitcount-heading">
                        Cookie Policy
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
                        How we use cookies and similar technologies to enhance your SketchFlow experience.
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
                        <h2 className="text-3xl font-bold tracking-tight mb-6">What Are Cookies?</h2>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                Cookies are small text files that are stored on your device when you visit our website.
                                They help us provide you with a better experience by remembering your preferences,
                                keeping you signed in, and helping us understand how you use SketchFlow.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                We use cookies responsibly and transparently. You have control over which cookies you
                                accept, and we'll always ask for your consent for non-essential cookies.
                            </p>
                        </div>
                    </div>

                    {/* Cookie Types */}
                    <div className="space-y-12">
                        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Types of Cookies We Use</h2>

                        {cookieTypes.map((type, index) => (
                            <div key={index} className="border rounded-lg p-8 bg-card">
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <type.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-2xl font-bold tracking-tight">{type.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${type.required
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                }`}>
                                                {type.required ? 'Required' : 'Optional'}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground mb-4">{type.description}</p>
                                        <div>
                                            <h4 className="font-semibold mb-2">Examples:</h4>
                                            <ul className="space-y-1">
                                                {type.examples.map((example, exampleIndex) => (
                                                    <li key={exampleIndex} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                                                        <span className="text-sm text-muted-foreground">{example}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cookie Management */}
                    <div className="mt-16 p-8 bg-muted/30 rounded-lg">
                        <h3 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
                            <Settings className="w-6 h-6 text-primary" />
                            Managing Your Cookie Preferences
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="font-semibold mb-2">Browser Settings</h4>
                                <p className="text-sm text-muted-foreground">
                                    You can control cookies through your browser settings. Most browsers allow you to block or delete cookies.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">SketchFlow Settings</h4>
                                <p className="text-sm text-muted-foreground">
                                    Manage your cookie preferences directly in your SketchFlow account settings.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Third-Party Cookies</h4>
                                <p className="text-sm text-muted-foreground">
                                    We may use third-party services that set their own cookies. You can opt out of these individually.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Cookie Consent</h4>
                                <p className="text-sm text-muted-foreground">
                                    You can withdraw your consent for optional cookies at any time through our cookie banner.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="flex-1">
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Cookie Preferences
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Eye className="w-4 h-4 mr-2" />
                                View Current Cookies
                            </Button>
                        </div>
                    </div>

                    {/* Third-Party Services */}
                    <div className="mt-16">
                        <h3 className="text-2xl font-bold tracking-tight mb-6">Third-Party Services</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 border rounded-lg bg-card">
                                <h4 className="font-semibold mb-2">Analytics</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    We use analytics services to understand user behavior and improve our platform.
                                </p>
                                <a href="#" className="text-sm text-primary hover:underline">Learn more</a>
                            </div>
                            <div className="p-6 border rounded-lg bg-card">
                                <h4 className="font-semibold mb-2">Performance</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Performance monitoring helps us ensure SketchFlow runs smoothly for everyone.
                                </p>
                                <a href="#" className="text-sm text-primary hover:underline">Learn more</a>
                            </div>
                            <div className="p-6 border rounded-lg bg-card">
                                <h4 className="font-semibold mb-2">Support</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Customer support tools help us provide better assistance when you need help.
                                </p>
                                <a href="#" className="text-sm text-primary hover:underline">Learn more</a>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="mt-16 text-center p-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold tracking-tight mb-4">Questions About Cookies?</h3>
                        <p className="text-muted-foreground mb-6">
                            If you have any questions about our use of cookies or need help managing your preferences, we're here to help.
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