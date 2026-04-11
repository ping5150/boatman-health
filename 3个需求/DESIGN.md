# Design System Document

## 1. Overview & Creative North Star: "The Private Steward"

This design system is engineered for "Boatman Health" (船夫健康), a medical consulting platform serving high-net-worth individuals. To move beyond the generic "clinic app" aesthetic, we adopt the Creative North Star of **"The Private Steward."** 

The interface should feel like a bespoke editorial publication—authoritative, calm, and meticulously curated. We reject the rigid, boxy constraints of standard mobile apps in favor of **Intentional Asymmetry**. By utilizing overlapping elements, deep tonal layering, and an aggressive typography scale, we create an environment that feels less like a tool and more like an exclusive concierge service. Whitespace is not "empty"; it is a luxury material used to provide the user with breathing room and clarity amidst complex medical journeys.

---

## 2. Colors: Tonal Depth vs. Structural Lines

The palette is anchored in deep, nautical blues and crisp neutrals to evoke stability and the "Boatman" heritage.

*   **Primary Hierarchy:** Use `primary` (#001e40) for core navigational elements and `primary_container` (#003366) for high-impact editorial backgrounds. 
*   **Secondary Accents:** `secondary` (#075fab) and `secondary_container` (#70aeff) provide a "Calm Light Blue" contrast, used sparingly to guide the eye toward action.

### The "No-Line" Rule
To maintain a premium, seamless feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background shifts. A `surface_container_low` section sitting on a `surface` background creates a sophisticated, modern transition that feels organic rather than mechanical.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. 
*   **Base:** `surface` (#f7f9fc)
*   **Subtle Depth:** Place `surface_container_lowest` (#ffffff) cards on top of `surface_container_low` (#f2f4f7) backgrounds. This "nested" depth creates a soft, natural lift without the clutter of lines.

### Signature Textures & Glassmorphism
*   **The Glass Rule:** For floating navigation or modal overlays, use `surface` colors at 80% opacity with a `20px` backdrop-blur. This "frosted glass" effect allows content to bleed through, ensuring the UI feels integrated.
*   **Gradients:** Use subtle linear gradients (e.g., `primary` to `primary_container`) on hero cards to mimic the depth of deep water, adding visual "soul" to the professional tone.

---

## 3. Typography: Editorial Authority

We use a dual-font strategy to balance modern clean lines with functional legibility.

*   **Display & Headlines (Manrope):** Large-scale headlines (e.g., `display-lg` at 3.5rem) should be used to create an "Editorial" feel. Bold, authoritative, and spacious.
*   **Body & Titles (Work Sans):** Chosen for its exceptional legibility in professional contexts. `body-lg` (1rem) is the standard for consulting reports, providing a comfortable reading experience for high-stakes information.

**Hierarchy as Identity:** The massive gap between `display-lg` and `body-sm` is intentional. It creates a rhythm of "Statement and Detail," mirroring the way a private consultant speaks—bold promises backed by meticulous data.

---

## 4. Elevation & Depth: The Layering Principle

Elevation in this system is achieved through **Tonal Layering**, not structural shadows.

*   **Ambient Shadows:** If a card must float (e.g., a "Start Consultation" CTA), use an extra-diffused shadow: `y: 8px, blur: 24px, opacity: 6%`. The shadow color should be a tinted version of the primary blue, never pure grey, to mimic natural light filtered through a premium environment.
*   **The "Ghost Border" Fallback:** If a container requires more definition for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen—a "ghost" of a border.
*   **Visual Continuity:** As seen in the reference material's "Service Process" (Page 2), use flowing, curved paths to connect disparate pieces of information, breaking the traditional "grid" to suggest a guided journey.

---

## 5. Components

### Buttons
*   **Primary:** High-contrast `on_primary` text on `primary` background. Use `xl` (0.75rem) rounded corners for a soft but professional feel.
*   **Tertiary (Editorial Link):** No background, just `secondary` text with a slightly heavier weight.

### Cards & Lists
*   **Rule:** Forbid the use of divider lines.
*   **Implementation:** Separate list items using `spacing-4` (1.4rem) of vertical whitespace. Group related content using `surface_container` backgrounds rather than boxes.

### Input Fields
*   **State:** Use `surface_container_highest` for the input background to create a "well" effect.
*   **Focus:** Transition the "Ghost Border" from 15% to 60% opacity using the `secondary` color.

### Bespoke Components
*   **The Stewardship Timeline:** A custom vertical path (inspired by the "Boatman" oars or waves) that connects medical milestones using `secondary_container` dots.
*   **Glass Modals:** Full-screen overlays for document viewing that use high backdrop blur to keep the user focused on the "Consultation" context.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. A wider left-hand margin for headlines creates a sophisticated, "magazine" layout.
*   **Do** prioritize "Stewardship" icons—thin-stroke, custom-drawn icons that represent guidance, protection, and health.
*   **Do** use `spacing-16` and `spacing-20` for major section breaks. Premium design needs room to breathe.

### Don't:
*   **Don't** use 100% black (#000000). Always use `on_surface` (#191c1e) for text to maintain a softer, higher-end contrast.
*   **Don't** use standard "Material Design" shadows. They are too aggressive for a private health context.
*   **Don't** crowd the screen. If a high-net-worth user has to squint or hunt for a button, the "Stewardship" promise is broken.