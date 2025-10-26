# Design Guidelines: AI Financial Model Creation Tool

## Design Approach

**Selected Approach:** Design System - Professional Productivity Application  
**Primary Influences:** Linear (typography hierarchy), Stripe (professional restraint), Notion (structured information density)  
**Justification:** This is a utility-focused, information-dense productivity tool where accuracy, trust, and efficiency are paramount. Users need clear guidance through a multi-step financial modeling process.

---

## Core Design Principles

1. **Professional Trustworthiness** - Financial tools demand credibility through clean, precise design
2. **Progressive Disclosure** - Multi-step form reveals complexity gradually
3. **Clear Hierarchy** - Users always know where they are in the process
4. **Data Clarity** - Financial information must be immediately scannable

---

## Typography System

**Font Families:**
- Primary: Inter (via Google Fonts) - for UI, forms, body text
- Monospace: JetBrains Mono - for numerical data, financial figures

**Type Scale:**
- Page Titles: text-4xl font-semibold (multi-step headers)
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels: text-sm font-medium
- Helper Text: text-sm
- Data/Numbers: text-base font-mono

**Hierarchy Rules:**
- Step indicators use bold, larger type
- Financial metrics use monospace exclusively
- Form labels consistently text-sm font-medium
- All numbers aligned right in tables

---

## Layout System

**Spacing Primitives:** Tailwind units of 3, 4, 6, 8, 12, 16  
**Common Patterns:**
- Section padding: py-12 px-6
- Card padding: p-6
- Form element spacing: space-y-4
- Grid gaps: gap-6
- Button groups: space-x-3

**Container Strategy:**
- Application wrapper: max-w-7xl mx-auto
- Form containers: max-w-3xl mx-auto
- Full-width data tables: w-full with horizontal scroll
- Sidebar (if needed): w-64 fixed

**Grid Layouts:**
- Input forms: Single column on mobile, 2-column grid (md:grid-cols-2) on desktop
- Sector selection cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Metric displays: grid-cols-2 md:grid-cols-4
- Summary panels: grid-cols-1 lg:grid-cols-3

---

## Component Library

### Navigation & Progress
**Multi-Step Progress Indicator:**
- Horizontal stepper with numbered circles
- Active step emphasized with larger size
- Completed steps with checkmark icons (Heroicons)
- Connecting lines between steps
- Step labels below circles (text-sm)

**Top Navigation:**
- Fixed header with logo/title left-aligned
- Action buttons (Save Draft, Export) right-aligned
- Subtle bottom border separation

### Forms & Inputs
**Text Input Fields:**
- Border-based (border rounded-lg)
- Label above input (text-sm font-medium mb-2)
- Placeholder text for guidance
- Focus state with ring
- Helper text below (text-sm)

**Select Dropdowns:**
- Native select elements styled consistently
- Icon indicator on right (chevron-down from Heroicons)
- Same border treatment as text inputs

**Radio Groups:**
- Vertical stack with clear spacing (space-y-3)
- Radio with label inline
- Supporting description text under each option

**Number Inputs:**
- Right-aligned text for financial figures
- Currency prefix/suffix as appropriate
- Increment/decrement controls

### Data Display
**Business Sector Cards:**
- Bordered cards (border rounded-lg p-4)
- Header with sector name (font-medium)
- Key metrics grid (2-column layout)
- Inachee Index Score prominently displayed
- Hover state with subtle border emphasis
- Select/Deselect button

**Financial Metrics Table:**
- Clean, minimal table design
- Header row with sticky positioning
- Alternating row backgrounds for readability
- Monospace font for all numerical columns
- Right-aligned numbers
- Sortable column headers with icon indicators

**Agent Status Display:**
- Card showing current active agent
- Agent name with icon (custom AI/robot icon placeholder)
- Progress bar or spinner
- Status text ("Analyzing data...", "Building model...")
- List of completed agents with checkmarks

### Actions & Feedback
**Primary CTA Buttons:**
- Solid background with rounded corners (rounded-lg)
- Medium padding (px-6 py-3)
- Font weight medium
- Full width on mobile, auto width on desktop

**Secondary Buttons:**
- Border-only style (border-2)
- Same sizing as primary
- Used for "Back" and "Save Draft" actions

**Button Groups:**
- Horizontal arrangement with space-x-3
- Primary action right-aligned
- Secondary actions left-aligned

**Loading States:**
- Spinner component (animated SVG)
- Skeleton screens for data loading
- Disabled state for buttons during processing

### Cards & Containers
**Section Cards:**
- Subtle border (border)
- Rounded corners (rounded-xl)
- Consistent padding (p-6)
- Optional header with bottom border

**Summary Panel:**
- Emphasized border (border-2)
- Displays final model summary
- Download button prominently placed
- File size and format indicators

---

## Icons

**Library:** Heroicons (via CDN)  
**Usage:**
- Form validation: check-circle, exclamation-circle
- Navigation: chevron-right, chevron-down, arrow-left
- Actions: download, save, refresh
- Progress: check, clock, cog
- Data: chart-bar, table-cells, document-text
- AI Agents: <!-- CUSTOM ICON: robot/AI assistant --> placeholders

**Implementation:**
- Inline with text: h-5 w-5
- Buttons: h-4 w-4
- Large indicators: h-8 w-8

---

## Responsive Behavior

**Breakpoint Strategy:**
- Mobile-first approach
- Tablet (md:): 768px
- Desktop (lg:): 1024px

**Key Adaptations:**
- Forms: Stack to single column on mobile
- Navigation: Hamburger menu on mobile
- Sector cards: 1 column mobile → 2 tablet → 3 desktop
- Progress stepper: Vertical on mobile, horizontal on desktop
- Data tables: Horizontal scroll with fixed first column on mobile

---

## Animations

**Minimal Motion Principles:**
- Transitions on state changes: transition-all duration-200
- Fade-in for new content sections
- Smooth progress bar animation
- NO scroll-triggered animations
- NO complex page transitions
- Simple hover states only

**Specific Animations:**
- Form validation fade-in (success/error messages)
- Agent status card smooth transition when switching agents
- Progress bar fill animation (linear, 1-2s duration)

---

## Layout-Specific Guidelines

**Multi-Step Form Flow:**
1. **Step 1: Business Idea Input**
   - Centered form container (max-w-3xl)
   - Large textarea for business description
   - Sector selection dropdown
   - Next button bottom-right

2. **Step 2: Sector Details & Metrics**
   - Grid of sector cards (responsive columns)
   - Search/filter bar at top
   - Selected sector highlighted state
   - Metrics displayed in card format

3. **Step 3: Financial Assumptions**
   - Two-column form grid
   - Grouped inputs (Startup Costs, Revenue, Margins)
   - Real-time calculation display
   - Range sliders for percentages

4. **Step 4: AI Processing**
   - Centered content area
   - Large agent status card
   - Progress indicator (0-100%)
   - Agent queue visualization (4 agents listed)
   - Estimated time remaining

5. **Step 5: Results & Download**
   - Summary statistics grid (4 metrics across)
   - Preview section showing key model outputs
   - Large download button (primary CTA)
   - Options for file format (Excel default)

**Overall Application Shell:**
- Fixed header (h-16)
- Main content area with generous padding
- Footer with minimal information (optional)
- No sidebars unless persistent navigation needed

---

## Accessibility Implementation

- All form inputs have visible labels
- ARIA labels for icon-only buttons
- Focus indicators on all interactive elements
- Sufficient contrast ratios (WCAG AA minimum)
- Keyboard navigation through entire form flow
- Error messages linked to inputs via aria-describedby
- Progress announcements for screen readers

---

## Images

**No hero images required** - This is a web application interface, not a marketing page.

**Optional Brand Elements:**
- Small logo in top-left header (h-8)
- Illustrated empty states for data tables before selection
- Icon set for different business sectors (can use emojis as fallback)