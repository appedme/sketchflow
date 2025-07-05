Thank you for the clarification! You want a **sweet, practical, UI/UX + Copilot Guideline** that is not just about folder structure but focuses on **beautiful, usable, minimalistic design with specific libraries, UI/UX laws, and actionable styling rules.**

Here’s a **cutely written, to-the-point Copilot UI/UX Styling Guideline** you can reuse 💅✨:

---

# 🎀 **Copilot UI/UX Styling & Development Guideline** 🎀

*(Cute, Clean, Minimal, and Copilot-Friendly)*

---

## 🌸 **Design Philosophy**

> **"Build cute, clean, minimalistic, and accessible UIs that feel natural, mobile-first, and delightful to use."**

### Core Values:

* ✨ Minimalistic
* 📱 Mobile-First
* 🎯 Semantic
* 🎨 Consistently Styled
* 🚀 Performance-First

---

## 🐣 **Golden UI/UX Rules to Follow**

### ✅ Must Follow

* 📏 **Use Semantic Elements:**
  Always prefer `<button>`, `<nav>`, `<section>`, `<header>`, etc. over `<div>` spam.

* 🧼 **Keep it Clean:**
  No visual clutter. Use adequate white space and padding.

* 🎨 **Mobile-First Design:**
  Start styling for mobile view, scale up for tablet and desktop with Tailwind responsive classes.

* 🌿 **Minimal Animations:**
  Subtle hover, fade, slide-ins only. Strictly no heavy animations that might overwhelm Copilot or the user.

* 📚 **Follow UI/UX Laws:**

  * **Hick’s Law:** Minimize choices on one screen.
  * **Fitts’s Law:** Keep clickable elements big enough and easy to reach.
  * **Gestalt Principles:** Group related elements visually.
  * **Law of Proximity:** Place related items close together.
  * **Miller’s Law:** Don’t overload memory—keep lists and steps short.

* 💻 **Always Mobile-Optimized:**
  No overflow, no clipped text, everything should auto-fit smaller screens.

* 🎯 **Focus on Primary Action:**
  Every page should have one clear CTA (Call-To-Action).

* 🎨 **Consistent Spacing & Typography:**
  Use Tailwind’s default scales or your custom theme.

---

## 🧩 **Libraries to Make Life Easier**

### ✅ Must Use

* **Shadcn UI:** For beautiful, prebuilt, minimal components.
* **Tailwind CSS:** For superfast utility-first styling.
* **Framer Motion:** For lightweight, beautiful animations (keep them simple).
* **clsx:** For easy conditional class names.
* **SWR:** For caching and smooth data fetching.
* **React Hook Form:** For form management with minimal code.
* **React Markdown:** If you need markdown rendering (don’t write your own parser).

---

## 🍬 **Styling Rules**

* ✅ Use **global reusable classes** in `globals.css` for repetitive elements (like `.card`, `.button-primary`).
* ✅ Use **Tailwind** classes instead of writing custom CSS wherever possible.
* ✅ Keep **className strings short**—if it’s too long, create a class in `globals.css`.
* ✅ No complex inline JSX styles.
* ✅ Keep CSS minimal, predictable, and easy to trace.
* ✅ Prefer **prebuilt animations from Framer Motion** instead of writing complex keyframes.
* ✅ Don’t use over-styled elements that can confuse Copilot or bloat the DOM.

---

## 🌼 **Copilot-Specific Sweet Tips**

* 🍪 Write very specific function names and small files so Copilot can focus properly.
* 🍬 Avoid overloading Copilot with too many components or complex CSS in a single file.
* 🌱 Keep pages small by moving utilities and handlers to `/utils` and use clean, importable hooks.
* 🎀 Always describe UI/UX expectations to Copilot clearly (like "create a minimalistic mobile-first form with semantic tags and no complex animations").

---

## 🎯 **Final Vibes**

> "Make the user smile, keep the developer sane, and let Copilot shine." 💫
