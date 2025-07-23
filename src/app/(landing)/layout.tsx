import { Navigation, Footer } from "@/components/landing";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
}