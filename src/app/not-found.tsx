"use client";
// import { useTheme } from "next-themes";
import { Glitchy404 } from "@/components/ui/glitcgy-text";

export default function Page404() {

//   const { theme } = useTheme();
  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center">
        <Glitchy404 width={800} height={232} 
        // color={theme === "dark"? "#fff" : "#000"}
         />
    </div>
  );
}
