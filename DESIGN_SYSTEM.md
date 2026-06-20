# EASYDEV SUPPORT AI DESIGN SYSTEM

---

## 1. DESIGN PRINCIPLES

1. **Accessibility First (WCAG 2.1 AA)**: All components must maintain a contrast ratio >= 4.5:1, support complete keyboard navigation (tabbing, focus rings), and declare appropriate WAI-ARIA roles.
2. **Keyboard First UX**: Power users (support agents) must be able to navigate the entire Unified Inbox and perform all core ticket modifications using keyboard shortcuts.
3. **AI First UX**: AI suggestions, confidence scores, and token cost metrics are displayed inline as core UI elements rather than hidden in dropdowns.
4. **Enterprise Speed**: Zero unnecessary rerenders. Real-time updates utilize optimistic Zustand updates before Socket.IO acknowledgments.

---

## 2. COLOR SYSTEM (Tailwind Theme Config)

```css
@theme {
  /* Brand/Primary (Blue-Grounded Slate) */
  --color-primary-50: hsl(210, 40%, 96.1%);
  --color-primary-100: hsl(210, 40%, 90%);
  --color-primary-500: hsl(217, 91%, 60%); /* Core Brand */
  --color-primary-600: hsl(221, 83%, 53%);
  --color-primary-900: hsl(222, 47%, 11%);

  /* Neutrals (Sleek Slate) */
  --color-neutral-50: hsl(210, 40%, 98%);
  --color-neutral-100: hsl(210, 40%, 96%);
  --color-neutral-200: hsl(214, 32%, 91%);
  --color-neutral-500: hsl(215, 16%, 47%);
  --color-neutral-900: hsl(222, 47%, 11%);

  /* Contextual States */
  --color-success: hsl(142, 76%, 36%);
  --color-warning: hsl(48, 96%, 53%);
  --color-danger: hsl(346, 84%, 61%);
  --color-info: hsl(199, 89%, 48%);

  /* ShadCN Variables mapping */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  --z-index-dropdown: 1000;
  --z-index-modal: 2000;
  --z-index-tooltip: 3000;
}
```

---

## 3. TYPOGRAPHY Scale

* **Font Family**: Inter, sans-serif (Google Fonts)
* **Headings**:
  - H1: `text-4xl font-bold tracking-tight leading-none`
  - H2: `text-2xl font-semibold tracking-tight`
  - H3: `text-lg font-medium`
* **Body Text**: `text-sm leading-relaxed text-neutral-900`
* **Labels / Microcopy**: `text-xs font-semibold uppercase tracking-wider text-neutral-500`

---

## 4. SPACING SYSTEM

* **Grid Base**: 4px grid (`1rem = 16px`)
* **Paddings & Margins**:
  - Compact: `p-2` / `m-2` (8px)
  - Standard: `p-4` / `m-4` (16px)
  - Loose: `p-6` / `m-6` (24px)
* **Responsive Breakpoints**:
  - Mobile: `sm: (640px)`
  - Tablet: `md: (768px)`
  - Laptop: `lg: (1024px)`
  - Desktop: `xl: (1280px)`
  - Wide Screen: `2xl: (1536px)`

---

## 5. REUSABLE SYSTEM COMPONENTS (ShadCN Catalog)

### 5.1 Basic Inputs & Interactive
* **Buttons**: Custom variants for `default`, `secondary`, `destructive`, `outline`, `ghost`. Focus ring triggers on tab.
* **Selects / Comboboxes**: Uses Radix UI Portal popovers with fuzzy match searching.

### 5.2 Enterprise Components
* **Filter Builder**:
  ```typescript
  interface FilterRule {
    field: string;
    operator: 'equals' | 'contains' | 'in';
    value: string;
  }
  ```
* **Saved Views Drawer**: Sidebar panel holding custom dashboard preset filters.
* **Global Command Palette**: Triggered via `Cmd+K`. Allows instant search of conversations, tickets, settings pages, and AI commands.

---

## 6. SPECIFIC COGNITIVE / AI UX COMPONENTS

### 6.1 AI Response Card
* Renders LLM output, source confidence level (e.g. `96%`), cost-per-execution, and user actions: **Apply Draft**, **Edit**, or **Escalate to Human**.
* CSS styling: Subtle cyan/blue gradient borders (`bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20`).

### 6.2 Typing & Presence Indicators
* **Presence Dot**: Green circle (`bg-success`) indicating agent is online. Pulsing animation (`animate-pulse`) when actively mapping sockets.
* **Typing Bubble**: Three pulsing dots using custom Tailwind keyframes:
  ```css
  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  ```

---

## 7. KEYBOARD NAVIGATION & WCAG RULES

* **Interactive Elements TabIndex**: Avoid using values > 0. Standardize using `tabIndex={0}` for keyboard-focusable container items.
* **Esc key handling**: All Dialogs, Drawers, Comboboxes, and Popovers must close instantly upon pressing `Escape` key.
* **Focus Ring Standard**: Apply `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none` on all focusable targets.
