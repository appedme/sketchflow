import { StackServerApp, StackClientApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/sign-in",
        signUp: "/sign-up",
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
    },
});

export const stackClientApp = new StackClientApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/sign-in",
        signUp: "/sign-up",
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
    },
});