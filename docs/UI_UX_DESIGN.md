# UI/UX Design System & Human-Computer Interaction Lab Guide
## SkyBook — Flight Reservation System

---

## 1. Design Philosophy & Aesthetic Intent

SkyBook embodies a modern, high-trust travel commerce aesthetic engineered to minimize cognitive friction during flight discovery, booking, and ticket management:
- **Trust & Clarity**: Navy blue anchors user security and authority, while sky blue signals aviation and fluidity.
- **Visual Hierarchy**: Crucial actionable elements (Search, Select Flight, Authorize Payment) use high-contrast accent tokens.
- **Scannability**: Flight cards present departure, arrival, duration, and price in an intuitive 3-column scan pattern.
- **Print Fidelity**: Electronic boarding passes transform into ink-friendly physical receipts via dedicated print CSS.

---

## 2. Color Palette & Design Tokens

```
+--------------------------------------------------------------------------+
|  Primary Navy (#0F172A)    |  Sky Blue (#0284C7)   |  Accent (#F97316)  |
|  Headers, Nav, Authority   |  Actions, Links, Tags |  Primary CTAs      |
+--------------------------------------------------------------------------+
|  Success (#10B981)         |  Warning (#F59E0B)    |  Danger (#EF4444)  |
|  Confirmed, Seats Avail.   |  Low Inventory (< 20) |  Cancelled, Errors |
+--------------------------------------------------------------------------+
|  Page Background (#F8FAFC) |  Card Surface (#FFF)  |  Border (#E2E8F0)  |
|  Soft Neutral Canvas       |  Elevated Content     |  Structural Divide |
+--------------------------------------------------------------------------+
```

### Color Token Reference Table
| Token Name | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `--primary-navy` | `#0F172A` | Brand header background, navigation bar, primary headings |
| `--primary-navy-light`| `#1E293B` | Admin sidebar, secondary containers, hover states |
| `--sky-blue` | `#0284C7` | Primary buttons, active tabs, PNR badges, brand logo icon |
| `--sky-blue-light` | `#E0F2FE` | Badge background, selected list items, icon containers |
| `--accent-orange` | `#F97316` | Main call-to-action ("Search Flights", "Proceed to Payment") |
| `--success-green` | `#10B981` | "Confirmed" ticket badge, available seat indicator |
| `--warning-amber` | `#F59E0B` | Low seat warning ("Only 12 seats left!"), delayed status |
| `--danger-red` | `#EF4444` | Cancelled badge, validation error messages, cancellation modal |
| `--bg-page` | `#F8FAFC` | Page body background canvas |
| `--bg-card` | `#FFFFFF` | Flight card surface, search form container, summary boxes |
| `--border-light` | `#E2E8F0` | Dividers, card borders, subtle grid outlines |

---

## 3. Typography Hierarchy

The system uses **Inter** (Google Fonts), optimized for screen readability and tabular figures:

| Element | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display 1 (Hero)** | 2.75rem (44px) | 800 (Extra Bold) | 1.2 | Homepage hero greeting |
| **Heading 1 (H1)** | 1.85rem (30px) | 800 (Bold) | 1.3 | Page titles (Search Results, Dashboard) |
| **Heading 2 (H2)** | 1.50rem (24px) | 700 (Bold) | 1.3 | Card group headings, popular routes |
| **Heading 3 (H3)** | 1.25rem (20px) | 700 (Bold) | 1.4 | Section headers, modal titles |
| **Heading 4 (H4)** | 1.05rem (17px) | 600 (Semi Bold) | 1.4 | Flight card departure/arrival times |
| **Body (Default)** | 0.95rem (15px) | 400 (Regular) | 1.5 | General text, inputs, labels |
| **Small / Metadata** | 0.85rem (13.5px)| 500 (Medium) | 1.5 | Subtext, airport station names, table cells |
| **Badge / Caption** | 0.75rem (12px) | 700 (Bold) | 1.0 | PNR tags, flight status pills, duration |

---

## 4. Spacing & Elevation System

- **Spacing Units**: Increments of 4px and 8px (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`).
- **Border Radii**:
  - `6px` (`--radius-sm`): Buttons, input fields, badges.
  - `10px` (`--radius-md`): Small cards, user dropdown, table wrapper.
  - `16px` (`--radius-lg`): Flight cards, search card, modal dialogs.
  - `9999px` (`--radius-full`): Status pills, passenger counter buttons.
- **Elevation Shadows**:
  - `--shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.05)` (Subtle borders)
  - `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.07)` (Flight cards, summary cards)
  - `--shadow-xl`: `0 20px 25px -5px rgba(0, 0, 0, 0.1)` (Search card, modal dialogs)

---

## 5. Responsive Viewport Strategy

| Breakpoint | Target Device | Layout Behavior |
| :--- | :--- | :--- |
| **< 480px** | Mobile Small (iPhone SE, Galaxy) | Single-column form, stacked origin/destination, full-width buttons. |
| **481px - 768px** | Mobile Large & Small Tablet | Flight cards stack into 2-row layout; ticket summary floats below form. |
| **769px - 1024px** | Tablet & Small Laptop (iPad) | Admin sidebar wraps horizontally to top navigation; 2-column search grid. |
| **> 1024px** | Desktop & Workstation | Full 5-column search grid, side-by-side sticky booking summary, 260px admin sidebar. |
