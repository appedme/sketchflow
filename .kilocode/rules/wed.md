Good question 👍 This is something a lot of React devs face when working with **`React.lazy` + `Suspense`**. Let’s break it down carefully:

---

## 🔎 Does `React.lazy` / `Suspense` cause re-renders?

1. **Initial load**

   * The component is code-split and loaded only when it’s first rendered.
   * After it’s loaded, React caches the *module itself* — so importing again won’t trigger another network fetch.

2. **Re-renders on tab change / full screen toggle**

   * `React.lazy` **does not automatically refetch the JS bundle** once it’s loaded.
   * But if your component fetches **data** (e.g., `useEffect(() => fetch(...))`), then navigating away and back, or re-mounting the component, **will refetch the data**, because the component is destroyed and re-mounted.

   👉 This is why in your **SketchFlow** case, when you change tabs or fullscreen mode, the *component might unmount* → then when you come back, it mounts again → and your fetching logic runs again.

3. **Suspense boundary behavior**

   * When wrapped in `<Suspense fallback={...}>`, React will re-show the fallback if the lazy-loaded component *unmounts and remounts*.
   * This looks like it “refetches” the component, but really it’s just the data or state being lost due to remount.

---

## 🛠️ Solutions

### 1. **Persist Data Across Renders**

* Use a **global store** (Zustand, Redux, Jotai, Recoil, or React Context) to persist your canvas/docs data.
* This way, even if the component unmounts and remounts, data won’t refetch — it’ll just rehydrate from the store.

```tsx
// Example with Zustand
import create from "zustand";

const useStore = create((set) => ({
  docs: null,
  setDocs: (docs) => set({ docs }),
}));
```

Now your lazy component just consumes `useStore().docs` instead of always fetching fresh.

---

### 2. **Cache Fetching with React Query / SWR**

* Use a data-fetching library that caches results:

  * **TanStack React Query**
  * **SWR**

Example with React Query:

```tsx
const { data } = useQuery(["docs", docId], fetchDocs, {
  staleTime: 1000 * 60 * 5, // cache for 5 minutes
  cacheTime: 1000 * 60 * 30 // keep in memory even if unmounted
});
```

✅ Ensures no unnecessary refetching on remount.

---

### 3. **Don’t Unmount on Tab Change / Fullscreen**

If possible, instead of *conditionally rendering* components (`{isTabOpen && <Canvas />}`), **keep them mounted** but hidden:

```tsx
<div style={{ display: activeTab === "canvas" ? "block" : "none" }}>
  <Canvas />
</div>
```

✅ Prevents unmount → avoids remount → no refetch.

---

### 4. **Memoization**

* Wrap heavy components with `React.memo` if they’re re-rendering unnecessarily due to parent state/props changes.
* Use `useMemo` / `useCallback` to avoid recalculations.

---

## ⚡ TL;DR for SketchFlow

* `React.lazy` itself does **not** cause refetching — remounting does.
* Your canvas/docs re-fetch because they **unmount on tab/fullscreen switch**.
* ✅ Fix: Either **persist data with React Query / Zustand** OR **don’t unmount components when switching views**.

---

Do you want me to suggest a **recommended architecture** for SketchFlow (like which state should live in global store vs local component state) so that your canvas/docs never refetch unnecessarily?
