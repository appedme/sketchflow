# 🔥 **Ultimate Copilot Project Guideline Prompt**

docs/copilot-instructions.md

*(Use this after describing your project idea to Copilot)*

---

> Note :- Always Prioritize SEO - proper metadata, structured data, and server-side rendering for SEO-critical pages. Use client-side fetching only when necessary for interactivity or real-time updates. JSONLD and PWA for structured data and performance optimization. use sharp image library for image generation. generate sitemap and robots.txt, create a js script to generate feeds opensearch.xml and others seo req files for better SEO. Use nextjs route groups to manage diff layouts accross the application and lavarage all possible fetures of latest nextjs version. use pnpm
## 📂 **Folder Structure & Modularization**

1. Use **Next.js 15 with App Router and Server Actions** for secure, backend-friendly architecture.
2. Follow **strict modular folder structures:**

   * Feature-based folders inside `/components`.
   * No unrelated components in the same folder.
   * Create a dedicated `/constants` folder with **deeply nested feature-specific subfolders.**
     👉 Strictly **no constants, hardcoded values, or JSON directly inside `page.tsx` files.**
3. If there are **too many functions in `page.tsx`:**

   * Create a separate `/utils` folder with feature-specific subfolders.
   * Export functions as `*` from a single `index.ts` per folder for clean imports.
4. Create a **`/hooks` folder** for custom, reusable hooks. Keep hooks focused and modular.
5. Create a **`/wrappers` folder** for reusable layout, error boundaries, and higher-order components.
- . write codes slower but never do any error and keep all the guildline in your global context
- . use nextjs route gruops to manage diff layouts accross the application and lavarage all possible fetures of latest nextjs version.

---

## 🎨 **CSS & Styling Strict Rules**

6. Prefer **Shadcn UI pure components** for rapid UI scaffolding and minimal extra code.
7. Use **TailwindCSS** heavily for styling.
8. If CSS for a `div` or any element becomes too long and is used globally:

   * Create reusable classes in `globals.css` (example: `.card`, `.btn`, `.input`).
   * Or create a separate CSS file for that specific reusable style.
9. Strictly **no complex inline JSX CSS**. Keep the code short and readable.
10. Minimize unnecessary animations and CSS complexity to keep Copilot suggestions backend-friendly and accurate.

---

## 🔁 **State Management Best Practices**

11. If a page or component has **too many `useState` hooks:**

* Group related states into a single `useReducer` or a custom `useForm` or `useData` hook.
* Use form libraries like `react-hook-form` for complex forms to reduce multiple state variables.
* Minimize scattered state management; prefer local or context-based state over heavy prop drilling.

---

## ⚙️ **Utility & Reusability Standards**

12. Always create **small, reusable utility functions** inside the `/utils` folder.
13. Use **SWR library** extensively for data fetching, caching, and auto-revalidation.
14. Strictly avoid large, repetitive code in `page.tsx`. Move handlers like `handleResultClick`, `clearRecentSearches`, and `renderSearchResult` to the `/utils` folder.
15. Always prefer **wrappers, hooks, and modular utilities** to keep code readable and shorter.
16. Use third-party libraries wherever possible to minimize custom logic (example: markdown parsers, form validators, etc.).

---

## ✨ **Global Clean Code Practices**

17. Use **TypeScript with strict settings.**

* Keep all types in a separate `/types` folder.
* No complex inline types or type gymnastics.

18. Use **auto-generated types, routes, and handlers** wherever possible to reduce boilerplate.
19. Add **light documentation** using JSDoc or TypeScript comments where necessary for clarity, but avoid over-commenting.
20. Prioritize **code generation, config-driven rendering, and DRY patterns.**

## 🔄 **Data Fetching Strategy**

21. Prioritize **Server-Side Data Fetching:**

* Use Server Components and ssr / isr / Server Actions for initial data fetching
* Leverage ISR (Incremental Static Regeneration) for semi-dynamic content
* Only use client-side fetching (SWR/useEffect) when:
   - Data needs real-time updates
   - User-specific interactions require it
   - Interactive features depend on current client state
* Implement proper caching strategies with Next.js cache() function
* Use route handlers for API endpoints when necessary
* where seo is reuired use ssr and where seo is not required use client side fetching


---

## 🚀 **Core Mindset for Copilot and Development**

> **The goal is to build a project that is short, clean, minimal, modular, and scalable. Everything should be easy to extend and maintain. Copilot should be able to work in small, well-scoped files without hallucinating. Avoid clutter, write less code, and always leverage reusable utilities, wrappers, hooks, and third-party libraries wherever possible.**
---

- create a plan.md write all the plans in a clecklist as the project builds and you completes building that part tick it and continue to next part and continue till end dont stop