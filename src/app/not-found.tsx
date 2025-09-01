"use client";
import { Button } from "@/components/ui/button";
import { Backpack } from "lucide-react";
import Link from "next/link";

export default function Page404() {
    return (
        <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center gap-8">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
                <p className="text-xl text-muted-foreground">Page not found</p>
            </div>
            <Link href="/dashboard">
                <Button>
                    <Backpack className="w-4 h-4 mr-2" /> Go to Dashboard
                </Button>
            </Link>
        </div>
    );
}