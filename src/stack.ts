import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie", // storing auth tokens in cookies
  urls: {
    signIn: "/sign-in",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
    signUp: "/sign-in",
  },
});