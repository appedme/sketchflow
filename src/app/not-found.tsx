"use client";
import { Button } from "@/components/ui/button";
// import { useTheme } from "next-themes";
import { Glitchy404 } from "@/components/ui/glitcgy-text";
import { Backpack } from "lucide-react";
import Link from "next/link";

export default function Page404() {

    //   const { theme } = useTheme();
    return (
        <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center gap-8">
            <Glitchy404 width={800} height={232}
            // color={theme === "dark"? "#fff" : "#000"}
            />
            <Link
                href="/dashboard"
                className=""
            >
                <Button>
                    <Backpack /> Go to Dashboard
                </Button>
            </Link>
        </div>
    );
}
