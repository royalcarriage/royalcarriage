# Admin UI Design Specifications

**Date:** January 14, 2026
**Purpose:** Complete UI/UX specifications for all admin interfaces

---

## 🎨 Design System

### Color Palette

```css
/* Primary Brand Colors */
--primary: #0f172a; /* Dark blue/black */
--primary-light: #1e293b;
--primary-dark: #020617;

--accent: #d4af37; /* Luxury gold */
--accent-light: #e8d4a0;
--accent-dark: #b8941f;

/* Status Colors */
--success: #10b981; /* Green */
--warning: #f59e0b; /* Amber */
--error: #ef4444; /* Red */
--info: #3b82f6; /* Blue */

/* Neutrals */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Role Colors */
--super-admin: #8b5cf6; /* Purple */
--admin: #ef4444; /* Red */
--content-mgr: #3b82f6; /* Blue */
--coordinator: #10b981; /* Green */
--driver: #f59e0b; /* Amber */
```

### Typography

```css
/* Headings */
h1: font-size: 2.5rem, font-weight: 700
h2: font-size: 2rem, font-weight: 600
h3: font-size: 1.5rem, font-weight: 600
h4: font-size: 1.25rem, font-weight: 500

/* Body */
body: font-size: 1rem, font-weight: 400
small: font-size: 0.875rem
tiny: font-size: 0.75rem

/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif
--font-mono: 'JetBrains Mono', monospace
```

### Spacing Scale

```css
--space-xs: 0.25rem (4px) --space-sm: 0.5rem (8px) --space-md: 1rem (16px)
  --space-lg: 1.5rem (24px) --space-xl: 2rem (32px) --space-2xl: 3rem (48px)
  --space-3xl: 4rem (64px);
```

### Border Radius

```css
--radius-sm: 0.25rem --radius-md: 0.5rem --radius-lg: 0.75rem --radius-xl: 1rem
  --radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05) --shadow-md: 0 4px 6px -1px
  rgb(0 0 0 / 0.1) --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1) --shadow-xl: 0
  20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## 🏗️ Layout Structure

### Admin Shell

```
┌─────────────────────────────────────────────────────┐
│ [Logo] Royal Carriage Admin        [User] [Logout] │ <- Header (64px)
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│          │                                          │
│ Sidebar  │          Main Content Area              │
│ (240px)  │                                          │
│          │                                          │
│ • Nav    │                                          │
│ • Items  │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
}

/* Desktop */
@media (min-width: 1025px) {
}

/* Large Desktop */
@media (min-width: 1440px) {
}
```

---

## 📱 Component Specifications

### 1. Dashboard Widget

```typescript
<DashboardWidget
  title="Active Bookings"
  value="24"
  change="+12%"
  trend="up"
  icon={CalendarIcon}
  color="primary"
  loading={false}
/>
```

**Visual:**

```
┌────────────────────────────────┐
│ [Icon] Active Bookings         │
│                                │
│        24                      │
│        +12% ↑ vs last week    │
└────────────────────────────────┘
```

**Variants:**

- `size`: sm | md | lg
- `color`: primary | success | warning | error
- `trend`: up | down | neutral

### 2. Data Table

```typescript
<DataTable
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'status', label: 'Status', render: StatusBadge }
  ]}
  data={bookings}
  onSort={handleSort}
  onFilter={handleFilter}
  onRowClick={handleRowClick}
  pagination={true}
  pageSize={25}
/>
```

**Visual:**

```
┌─────────────────────────────────────────────────────┐
│ [Search] [Filter▼] [Export]              [+ New]   │
├─────┬────────────┬──────────┬─────────┬────────────┤
│ ID ↑│ Customer   │ Pickup   │ Status  │ Actions    │
├─────┼────────────┼──────────┼─────────┼────────────┤
│ 001 │ John Doe   │ O'Hare   │ Active  │ [View][…]  │
│ 002 │ Jane Smith │ Midway   │ Pending │ [View][…]  │
├─────┴────────────┴──────────┴─────────┴────────────┤
│ Showing 1-25 of 150          [< 1 2 3 ... 6 >]    │
└─────────────────────────────────────────────────────┘
```

### 3. Status Badge

```typescript
<StatusBadge
  status="active"    // active | pending | completed | cancelled
  size="md"
  showIcon={true}
/>
```

**Visual:**

```
┌─────────────┐
│ ● Active    │  (Green)
└─────────────┘

┌─────────────┐
│ ◐ Pending   │  (Amber)
└─────────────┘

┌─────────────┐
│ ✓ Completed │  (Blue)
└─────────────┘

┌─────────────┐
│ ✗ Cancelled │  (Red)
└─────────────┘
```

### 4. Approval Queue

```typescript
<ApprovalQueue
  items={suggestions}
  onApprove={handleApprove}
  onReject={handleReject}
  onEdit={handleEdit}
/>
```

**Visual:**

```
┌─────────────────────────────────────────────────────┐
│ Content Suggestions (3 pending review)              │
├─────────────────────────────────────────────────────┤
│ SEO Meta Description - Home Page          [CRITICAL]│
│ Original: "Chicago airport transportation..."       │
│ Suggested: "Premium O'Hare & Midway limo..."       │
│ Impact: +15% CTR                                    │
│ [Approve] [Edit] [Reject]                          │
├─────────────────────────────────────────────────────┤
│ H1 Heading - Fleet Page                      [HIGH] │
│ Original: "Our Fleet"                               │
│ Suggested: "Luxury Chicago Airport Fleet"          │
│ Impact: +8% SEO Score                               │
│ [Approve] [Edit] [Reject]                          │
└─────────────────────────────────────────────────────┘
```

### 5. Quick Action Button

```typescript
<QuickActionButton
  icon={SparklesIcon}
  label="Analyze Page"
  onClick={handleAnalyze}
  variant="primary"
  size="lg"
/>
```

**Visual:**

```
┌────────────────────┐
│  ✨                │
│  Analyze Page      │
│  Generate insights │
└────────────────────┘
```

### 6. Timeline Component

```typescript
<Timeline
  events={[
    { time: '10:30 AM', type: 'pickup', status: 'completed' },
    { time: '11:45 AM', type: 'dropoff', status: 'in_progress' }
  ]}
/>
```

**Visual:**

```
┌────────────────────────────────┐
│ 10:30 AM                       │
│   ●─────                       │
│   Picked up from O'Hare        │
│   Terminal 1, Gate B12         │
│                                │
│ 11:45 AM (ETA)                 │
│   ◯─────                       │
│   Drop-off at Downtown         │
│   123 W Madison St             │
└────────────────────────────────┘
```

### 7. Map View

```typescript
<MapView
  center={[41.8781, -87.6298]}  // Chicago
  markers={[
    { lat: 41.9742, lng: -87.9073, type: 'pickup', label: 'O\'Hare' },
    { lat: 41.8781, lng: -87.6298, type: 'dropoff', label: 'Downtown' }
  ]}
  route={routeCoordinates}
  zoom={10}
/>
```

### 8. Notification Center

```typescript
<NotificationCenter
  notifications={[
    { id: 1, type: 'booking', message: 'New booking from John Doe', time: '2m ago', unread: true },
    { id: 2, type: 'alert', message: 'Driver ETA updated', time: '5m ago', unread: false }
  ]}
  onMarkRead={handleMarkRead}
  onDismiss={handleDismiss}
/>
```

**Visual:**

```
┌────────────────────────────────┐
│ Notifications (2 unread)       │
├────────────────────────────────┤
│ ● New booking from John Doe    │
│   O'Hare → Downtown • 2m ago  │
├────────────────────────────────┤
│   Driver ETA updated           │
│   Arriving in 5 mins • 5m ago │
└────────────────────────────────┘
```

---

## 📄 Page Layouts

### Super Admin Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Super Admin Dashboard                       Last sync: 1m ago│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Revenue  │ │ Bookings │ │ Active   │ │ System   │       │
│ │ $15.2K   │ │ 142      │ │ Users 24 │ │ Health ✓ │       │
│ │ +18% ↑   │ │ +5% ↑    │ │ +2       │ │ 99.8%    │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ System Health ──────────────────────────────────────────    │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ CPU Usage:    45% ████████──────────                   │  │
│ │ Memory:       62% ████████████──────                   │  │
│ │ Database:     18% ███─────────────────                 │  │
│ │ API Response: 124ms                                    │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Recent Activity ─────────────────────────────────────────   │
│ • User created: driver_john@email.com (2m ago)              │
│ • AI suggestion approved: Home page meta (5m ago)           │
│ • Booking completed: #12453 (8m ago)                        │
│                                                              │
│ Quick Actions ───────────────────────────────────────────   │
│ [Deploy Changes] [System Backup] [View Logs] [Settings]    │
└─────────────────────────────────────────────────────────────┘
```

### Content Manager Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Content Management Dashboard                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Pages    │ │ Pending  │ │ Avg SEO  │ │ Images   │       │
│ │ 23       │ │ Review 5 │ │ Score 87 │ │ 156      │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ AI Suggestions Pending Review ───────────────────────────   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ [CRITICAL] Home Page Meta Description                  │  │
│ │ Impact: +15% CTR       [Approve] [Edit] [Reject]      │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ [HIGH] Fleet Page H1 Heading                           │  │
│ │ Impact: +8% SEO        [Approve] [Edit] [Reject]      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Page Performance ────────────────────────────────────────   │
│ Home Page:          SEO 92  Content 88  [Analyze]          │
│ O'Hare Airport:     SEO 88  Content 85  [Analyze]          │
│ Fleet:              SEO 84  Content 90  [Analyze]          │
│                                                              │
│ Quick Actions ───────────────────────────────────────────   │
│ [Generate Content] [Create Image] [Analyze Pages]          │
└─────────────────────────────────────────────────────────────┘
```

### Driver Coordinator Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Dispatch Board                         Refresh: Auto (30s)   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Active Rides (6) ────────────────────────────────────────   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ #12456  John Doe → Downtown         Driver: Mike T     │  │
│ │ O'Hare T1 → 123 W Madison          ETA: 15 mins       │  │
│ │ Status: En Route ●●●●●●●●●●──────── 75%              │  │
│ │ [Track] [Contact] [Update]                            │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ #12457  Jane Smith → Airport        Driver: Sarah K    │  │
│ │ Loop → O'Hare T3                   ETA: 22 mins       │  │
│ │ Status: Pickup ●●●●───────────────── 30%              │  │
│ │ [Track] [Contact] [Update]                            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Available Drivers (4) ───────────────────────────────────   │
│ • Mike T.     [Sedan]    Downtown     [Assign]              │
│ • Sarah K.    [SUV]      O'Hare       [Assign]              │
│ • Tom R.      [Limo]     Naperville   [Assign]              │
│ • Lisa M.     [Sedan]    Schaumburg   [Assign]              │
│                                                              │
│ Dispatch Queue (2) ──────────────────────────────────────   │
│ [URGENT] Pick up in 10 mins - O'Hare to Loop               │
│ [SCHEDULED] Tomorrow 8 AM - Midway to Oak Brook             │
│                                                              │
│ [Create Booking] [View Map] [Driver Status]                │
└─────────────────────────────────────────────────────────────┘
```

### Driver Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ My Dashboard                           Status: Available ✓   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Today    │ │ This     │ │ Rating   │ │ Rides    │       │
│ │ $420     │ │ Week     │ │ 4.9 ⭐   │ │ Today 6  │       │
│ │ 6 rides  │ │ $1,840   │ │ (142)    │ │          │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ Current Ride ────────────────────────────────────────────   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ #12456  John Doe                                       │  │
│ │                                                         │  │
│ │ Pickup:  O'Hare Terminal 1, Gate B12                   │  │
│ │ Time:    10:30 AM (In 8 minutes)                       │  │
│ │                                                         │  │
│ │ Dropoff: 123 W Madison St, Chicago                     │  │
│ │ ETA:     11:15 AM                                       │  │
│ │                                                         │  │
│ │ Flight: UA1234 (On time)                               │  │
│ │ Special: Extra luggage assistance                       │  │
│ │                                                         │  │
│ │ [Navigate] [Call Customer] [Start Trip]                │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Upcoming Rides ──────────────────────────────────────────   │
│ • 2:00 PM  Downtown → Midway         #12458                │
│ • 5:30 PM  Naperville → O'Hare       #12460                │
│                                                              │
│ [Go Available] [Break] [End Shift]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Interaction Patterns

### Loading States

```typescript
// Skeleton loading
<Skeleton className="h-8 w-full" />

// Spinner
<Spinner size="lg" />

// Progress bar
<Progress value={60} />
```

### Empty States

```typescript
<EmptyState
  icon={InboxIcon}
  title="No bookings yet"
  description="When you receive bookings, they'll appear here"
  action={
    <Button onClick={createBooking}>
      Create First Booking
    </Button>
  }
/>
```

### Error States

```typescript
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to load bookings. Please try again.
  </AlertDescription>
</Alert>
```

### Success Messages

```typescript
<Toast>
  <ToastTitle>Success!</ToastTitle>
  <ToastDescription>
    Booking #12456 has been confirmed
  </ToastDescription>
</Toast>
```

---

## 📐 Responsive Behavior

### Mobile (<640px)

- Sidebar collapses to hamburger menu
- Widgets stack vertically
- Tables switch to card view
- Actions move to dropdown menu

### Tablet (641-1024px)

- Sidebar becomes collapsible
- 2-column widget grid
- Tables show essential columns only
- Touch-friendly action buttons

### Desktop (1025px+)

- Full sidebar visible
- 4-column widget grid
- All table columns visible
- Hover states and tooltips

---

## ♿ Accessibility

### Keyboard Navigation

- All interactive elements tabbable
- Escape closes modals/dropdowns
- Arrow keys navigate menus
- Enter/Space activates buttons

### Screen Readers

- Proper ARIA labels
- Semantic HTML elements
- Status announcements
- Error descriptions

### Color Contrast

- WCAG AA compliance minimum
- AAA for body text
- Don't rely on color alone
- High contrast mode support

---

**This design system ensures a consistent, professional, and accessible admin interface across all user roles.**
