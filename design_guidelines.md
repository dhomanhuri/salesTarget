# QuotaTrackr Design Guidelines

## Design Approach
**System-Based Approach**: Enterprise SaaS dashboard utilizing modern design system principles for data-dense, productivity-focused interface. Inspired by Linear's clarity, Stripe's data presentation, and shadcn/ui component philosophy.

## Core Design Principles
1. **Clarity First**: Information hierarchy optimized for quick scanning of targets, progress, and customer data
2. **Data Density**: Efficient use of space for tables, charts, and metrics without overwhelming users
3. **Role-Specific Views**: Distinct layouts for Admin, GM, and AM with appropriate information access
4. **Professional Presentation**: Clean, corporate aesthetic suitable for sales reporting and client presentations

---

## Typography

**Font Family**: Inter (Google Fonts CDN)
- **Headers**: Inter 600 (Semibold) - Dashboard titles, section headers
- **Body**: Inter 400 (Regular) - Tables, descriptions, forms
- **Metrics/Numbers**: Inter 700 (Bold) - Target amounts, sales figures, KPIs
- **Supporting Text**: Inter 500 (Medium) - Labels, captions

**Sizing Hierarchy**:
- Page titles: text-3xl (30px)
- Section headers: text-xl (20px)
- Card titles: text-lg (18px)
- Body/table content: text-sm (14px)
- Captions/metadata: text-xs (12px)

---

## Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, and 8 (e.g., p-4, gap-6, mb-8)
- Card padding: p-6
- Section spacing: mb-8
- Component gaps: gap-4
- Table row padding: py-3 px-4

**Grid Structure**:
- Dashboard metrics: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 for KPI cards
- Customer lists: Single column tables with horizontal scroll on mobile
- Chart sections: Full-width or 2-column (chart + summary) on desktop

**Container Widths**:
- Main content: max-w-7xl mx-auto px-6
- Sidebar navigation: w-64 (fixed left side)
- Presentation Mode: Full viewport w-screen

---

## Component Library

### Navigation
**Left Sidebar** (w-64, fixed):
- Logo/brand at top (h-16)
- Navigation items with icons (Heroicons)
- Role-conditional menu items
- User profile section at bottom
- Active state: subtle background highlight

### Dashboard Cards
**Metric Cards** (target vs actual):
- White background with subtle border
- Large number display (text-3xl, font-bold)
- Label below (text-sm, muted)
- Optional trend indicator (↑↓ with emerald/red)
- Shadow: shadow-sm, hover: shadow-md

### Data Tables
- Striped rows for readability
- Sticky header on scroll
- Filter controls above table (status, date range, AM selector)
- Pagination below (showing "X-Y of Z entries")
- Action column with icon buttons (edit, view, delete)
- Status badges with appropriate colors

### Forms & Inputs
- Floating labels or top-aligned labels
- Full-width inputs with border-gray-300
- Focus state: ring-2 ring-sky-500
- Currency inputs: Rp prefix, right-aligned numbers
- Date pickers: Calendar icon, dropdown
- File upload: Drag-and-drop zone with dashed border

### Charts (Recharts)
- Bar charts: Target vs Actual comparison
- Line charts: Progress over time
- Pie/Donut: Status breakdown (Prospect, Ongoing, Negotiation, Closed Won/Lost)
- Consistent color mapping: Primary for targets, Accent for actuals
- Tooltips with formatted Rupiah values
- Legend positioned below or right

### Status Badges
- Prospect: bg-blue-100 text-blue-800
- On Going: bg-yellow-100 text-yellow-800
- Negotiation: bg-purple-100 text-purple-800
- Closed Won: bg-emerald-100 text-emerald-800
- Closed Lost: bg-gray-100 text-gray-800
- Rounded-full px-3 py-1 text-xs font-medium

### Progress Timeline
- Vertical timeline with connecting line
- Date + activity description per entry
- Status indicator dot
- File attachment icons (if present)
- Reverse chronological order

### Presentation Mode
**Full-Screen Clean View for AM**:
- Remove sidebar navigation
- White background, maximum whitespace
- Large typography (scale up by 1.5x)
- Customer cards: grid-cols-1 md:grid-cols-2
- Timeline with generous spacing (py-8)
- Minimal borders and shadows
- Print-friendly layout

### Dialogs & Modals
- Centered overlay with backdrop blur
- Max-width: max-w-2xl for forms, max-w-4xl for detailed views
- Header with title and close button
- Footer with action buttons (Cancel + Primary action)

---

## Icons
**Heroicons** (outline for navigation, solid for inline actions):
- Dashboard: ChartBarIcon
- Targets: BullseyeIcon
- Customers: UsersIcon
- Reports: DocumentTextIcon
- Admin: CogIcon
- Progress: ClockIcon
- Upload: ArrowUpTrayIcon

---

## Interactions & States

**Buttons**:
- Primary: bg-sky-600 text-white px-4 py-2 rounded-md font-medium
- Secondary: border border-gray-300 bg-white text-gray-700
- Success: bg-emerald-600 text-white (for "Closed Won" actions)
- Hover states: Slight darkening, no complex animations
- Loading state: Spinner with disabled appearance

**Tables**:
- Row hover: bg-gray-50
- Sortable columns: Cursor pointer, icon indicator
- Selected row: bg-sky-50 border-l-4 border-sky-600

**Cards**:
- Subtle hover: shadow-md transition
- Click areas: Full card or specific CTA button

---

## Responsive Behavior

**Desktop (lg: 1024px+)**:
- Full sidebar visible
- 4-column metric grids
- Side-by-side chart layouts
- Expanded table columns

**Tablet (md: 768px)**:
- Collapsed sidebar (hamburger toggle)
- 2-column metric grids
- Stacked chart sections
- Horizontal scroll for wide tables

**Mobile (base: <768px)**:
- Bottom navigation or hamburger menu
- Single column layouts
- Card-based customer list
- Simplified charts (mobile-optimized)

---

## Accessibility
- WCAG 2.1 AA contrast ratios
- Keyboard navigation for all interactive elements
- ARIA labels on icon-only buttons
- Focus indicators on all form inputs
- Screen reader friendly table markup

---

## Currency & Data Formatting
- Rupiah: "Rp 1.500.000" (dot as thousand separator)
- Dates: "DD MMM YYYY" (e.g., "15 Jan 2024")
- Percentages: "85.5%" (one decimal)
- Large numbers: "Rp 1,5M" in compact views

---

## Images
No hero images required. This is a data-focused dashboard application. Use icons and charts for visual interest rather than photography. Optional: placeholder avatars for user profiles (first initial in colored circle).