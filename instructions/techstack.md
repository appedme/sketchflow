# 🚀 **Best Practices & Tech Stack Guideline**

*(For High-Quality, Scalable, Modern Web Projects)*

---

## ⚙️ **Core Tech Stack**

* ✅ **Next.js 15** – App Router, Server Actions (Secure, Scalable)
* ✅ **TypeScript** – Type Safety + Predictability
* ✅ **Tailwind CSS** – Utility-first Styling
* ✅ **ESLint + Prettier** – Code Linting & Formatting
* ✅ **Drizzle ORM** – Database Management (Typesafe & Easy) with simplest schema possible so less error prone
* ✅ **NextJS Server Actions** – Secure, server-side form handling and data fetching
* ✅ **Cloudflare D1** – Fast, lightweight, serverless SQL DB
* ✅ **Cloudflare Workers** – Edge Computing

!important: Use the latest version of Next.js and Cloudflare tools to ensure you have the latest features and security updates. and always read the official documentation for any updates or changes. read https://dev.to/sh20raj/cloudflare-d1-drizzle-orm-setup-guide-3oap for more details on setting up Drizzle ORM with Cloudflare D1.

  ```bash
  npm create cloudflare@latest -- my-next-app --framework=next --platform=workers
  ```
* ✅ **Auth.js v5** – Secure, flexible authentication
* ✅ **Next-PWA** – Offline Support, Data Caching, PWA Functionality
* ✅ **SWR** – Smart Caching & Revalidation for API Calls
* ✅ **Sharp Image Library** – For image optimization, dynamic image resizing, generating app icons and PWA logos from SVG

---

## 🌐 **SEO Best Practices**

* ✅ Use proper `<title>`, `<meta>` tags, Open Graph meta, structured data.
* ✅ Create readable, semantic URLs.
* ✅ Use Next.js `robots.txt` and `sitemap.xml`.
* ✅ Implement `next/image` for image optimization.
* ✅ Use server-side rendering (SSR) or static generation (SSG) for public pages.
* ✅ Keep page load times fast (optimized images, lazy loading).

---

## 📱 **PWA & Offline Readiness**

* ✅ Setup `next-pwa` for:

  * Offline page caching
  * Runtime caching strategies
  * App manifest for installable PWA
* ✅ Use service workers correctly to cache API responses and static assets.

---

## 📦 **Code Quality & Standards**

* ✅ Strictly use ESLint + Prettier setup.
* ✅ Type everything with TypeScript.
* ✅ Create minimal, reusable, well-documented components.
* ✅ Follow atomic design where possible.
* ✅ No magic numbers or hardcoded strings → move to `/constants` folder.
* ✅ Keep `page.tsx` files short → extract logic to `utils`, `hooks`, `wrappers`.

---

## 📚 **Developer Mindset & Process**

* ✅ If you **don’t know something → DO NOT GUESS.**

  * First, **search the official docs.**
  * Read a trusted tutorial or the GitHub repo.
  * Only then, implement.
* ✅ Never skip documentation-driven development.
* ✅ Always write self-explanatory code and use JSDoc where needed.
* ✅ Prefer configuration over convention-breaking hacks.

---

## 🔥 **Extra Pro Tools & Libraries (Optional, but Highly Recommended)**

* 🧩 **Zod** – Schema validation (for API and form data)
* 🧩 **React Hook Form** – Minimal, powerful form handling
* 🧩 **Framer Motion** – Lightweight animations (keep minimal)
* 🧩 **Shadcn UI** – For beautiful, prebuilt, accessible UI components
* 🧩 **clsx** – Clean conditional classNames
* 🧩 **React Markdown** – For rendering markdown (if needed)
* 🧩 **Lucide Icons** – Open-source, customizable icon set

---

## 🔒 **Security Practices**

* ✅ Always use **Next.js Server Actions** for form submissions & sensitive operations.
* ✅ Never trust client input → validate with Zod.
* ✅ Use HTTPS everywhere (Cloudflare by default).
* ✅ Sanitize dynamic inputs to prevent XSS or injection attacks.
* ✅ Use environment variables correctly (no secrets in the client bundle).

---

## 🌱 **Clean Architecture**

* ✅ Use modular folders: `/components`, `/hooks`, `/utils`, `/constants`, `/types`
* ✅ Use `index.ts` for barrel exports.
* ✅ Keep the **separation of concerns** very strict.
* ✅ Use SWR for all client-side fetching unless you use server components.
* ✅ Create feature-specific folders instead of a flat structure.

---

## 🌍 **Deployment & Hosting**

* ✅ Deploy via **Cloudflare Pages + Workers** for edge performance.
* ✅ Use `npm create cloudflare@latest` to scaffold the project properly.
* ✅ Set up CI/CD with GitHub and Cloudflare.

---

## 🧠 **Golden Rule**

> "If you don’t know how to do it — **don’t hack it blindly.**
> First, search the official docs.
> Read → Understand → Implement.
> Copilot helps, but **docs rule first.**"
> create tests and docs in there respective folders
not on / route
