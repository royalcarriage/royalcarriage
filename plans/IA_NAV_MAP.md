# Royal Carriage Limousine - Information Architecture & Navigation Map

## System-Wide Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     GLOBAL APPLICATION                           │
│              (Multi-Tenant SaaS Platform)                        │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐        ┌──────────┐
    │  Admin  │         │ Driver  │        │ Customer │
    │ Portal  │         │   App   │        │  Portal  │
    └────┬────┘         └────┬────┘        └────┬─────┘
         │                   │                   │
         └───────┬───────────┼───────────┬───────┘
                 │           │           │
    ┌────────────┴───┐   ┌───┴──────┐  ┌┴────────────┐
    │                │   │          │  │             │
    ▼                ▼   ▼          ▼  ▼             ▼
 Airport      Corporate Wedding Party  Public    Public
  Site          Site     Site    Bus   Sites     Sites
           (Blog)
```

---

## 1. Admin Portal Navigation

### Top Level Sections (Sidebar)

```
ADMIN PORTAL (admin.royalcarriagelimo.com)
│
├── 📊 Dashboard
│   ├── Real-Time Metrics
│   ├── Revenue Overview
│   ├── Active Rides
│   └── Quick Actions
│
├── 📅 Dispatch Management
│   ├── Ride Board
│   │   ├── Pending Rides
│   │   ├── Assigned Rides
│   │   ├── In Progress
│   │   └── Completed Today
│   │
│   ├── Create Booking
│   │   ├── ASAP Ride
│   │   ├── Scheduled Ride
│   │   ├── Recurring Ride
│   │   └── Charter Booking
│   │
│   ├── Driver Assignment
│   │   ├── Available Drivers
│   │   ├── Driver Profiles
│   │   ├── Assignment History
│   │   └── Auto-Assign Settings
│   │
│   └── Ride Details
│       ├── Booking Info
│       ├── Driver/Vehicle
│       ├── Location Tracking
│       ├── Customer Info
│       └── Completion Status
│
├── 🚗 Fleet Management
│   ├── Vehicle Inventory
│   │   ├── All Vehicles
│   │   ├── By Type (Sedan/SUV/Limo/Bus)
│   │   ├── Availability Calendar
│   │   └── Utilization Report
│   │
│   ├── Vehicle Details
│   │   ├── Registration
│   │   ├── Insurance
│   │   ├── Maintenance Schedule
│   │   ├── Service History
│   │   ├── Mileage Tracking
│   │   └── Image Gallery
│   │
│   ├── Maintenance Management
│   │   ├── Due Reminders
│   │   ├── Service Records
│   │   ├── Inspection Reports
│   │   └── Fuel Tracking
│   │
│   └── Fleet Analytics
│       ├── Vehicle Utilization
│       ├── Maintenance Costs
│       ├── Revenue per Vehicle
│       └── Fuel Efficiency
│
├── 👥 Driver Management
│   ├── Driver Directory
│   │   ├── All Drivers
│   │   ├── By Status (Active/Inactive/On Leave)
│   │   ├── Performance Ranking
│   │   └── Availability
│   │
│   ├── Driver Profiles
│   │   ├── Personal Info
│   │   ├── License & Documents
│   │   ├── Background Check
│   │   ├── Certifications
│   │   ├── Vehicle Assignments
│   │   └── Ride History
│   │
│   ├── Performance Metrics
│   │   ├── Rating & Reviews
│   │   ├── Completion Rate
│   │   ├── Punctuality
│   │   ├── Earnings
│   │   └── Incident Reports
│   │
│   ├── Driver Scheduling
│   │   ├── Weekly Schedule
│   │   ├── Availability Calendar
│   │   ├── Time Off Requests
│   │   └── Shift Management
│   │
│   └── Driver Pay Management
│       ├── Pay Periods
│       ├── Earnings Summary
│       ├── Deductions
│       ├── Pay Stubs
│       └── Payment History
│
├── 💼 Affiliate Management
│   ├── Affiliate Directory
│   │   ├── All Affiliates
│   │   ├── By Type (Referral/Provider)
│   │   ├── Commission Tracking
│   │   └── Performance
│   │
│   ├── Affiliate Details
│   │   ├── Company Info
│   │   ├── Commission Structure
│   │   ├── Ride Attribution
│   │   ├── Commission Earned
│   │   └── Payment History
│   │
│   ├── Commission Management
│   │   ├── Commission Rates
│   │   ├── Tiered Structure
│   │   ├── Performance Bonuses
│   │   └── Payout Schedule
│   │
│   └── Affiliate Reports
│       ├── Revenue Attribution
│       ├── Commission Summary
│       ├── Top Performing Affiliates
│       └── Retention Metrics
│
├── 💰 Accounting & Finance
│   ├── Financial Dashboard
│   │   ├── Revenue Overview
│   │   ├── Expense Summary
│   │   ├── Profit & Loss
│   │   └── Cash Flow
│   │
│   ├── Invoice Management
│   │   ├── Sent Invoices
│   │   ├── Unpaid Invoices
│   │   ├── Overdue Invoices
│   │   ├── Create Invoice
│   │   └── Invoice Templates
│   │
│   ├── Payment Processing
│   │   ├── Credit Card Payments
│   │   ├── ACH Transfers
│   │   ├── Payment Status
│   │   ├── Refunds
│   │   └── Payment History
│   │
│   ├── Expense Tracking
│   │   ├── Expense Categories
│   │   ├── Add Expense
│   │   ├── Expense Reports
│   │   └── Tax Deductions
│   │
│   ├── Financial Reports
│   │   ├── Income Statement
│   │   ├── Balance Sheet
│   │   ├── Cash Flow Statement
│   │   ├── Tax Summary
│   │   └── Export Reports
│   │
│   └── Bank Reconciliation
│       ├── Bank Accounts
│       ├── Reconciliation Status
│       ├── Discrepancy Report
│       └── Pending Transactions
│
├── 📝 Payroll Management
│   ├── Driver Payroll
│   │   ├── Pay Periods
│   │   ├── Calculate Payroll
│   │   ├── Review Earnings
│   │   ├── Process Payment
│   │   └── Payroll Reports
│   │
│   ├── Affiliate Payroll
│   │   ├── Commission Periods
│   │   ├── Calculate Commission
│   │   ├── Payout History
│   │   └── Commission Reports
│   │
│   └── Tax Reporting
│       ├── 1099 Forms
│       ├── W-2 Forms
│       ├── Tax Deposits
│       └── Tax Compliance
│
├── 📱 Customer Management
│   ├── Customer Directory
│   │   ├── All Customers
│   │   ├── By Tier (Bronze/Silver/Gold/Platinum)
│   │   ├── Ride Frequency
│   │   └── Revenue per Customer
│   │
│   ├── Customer Details
│   │   ├── Profile Info
│   │   ├── Ride History
│   │   ├── Saved Addresses
│   │   ├── Payment Methods
│   │   ├── Preferences
│   │   └── Ratings & Reviews
│   │
│   ├── Customer Support
│   │   ├── Support Tickets
│   │   ├── Communication History
│   │   ├── Refunds & Credits
│   │   └── Escalations
│   │
│   └── Loyalty Program
│       ├── Member Tiers
│       ├── Points System
│       ├── Rewards Catalog
│       └── Redemption History
│
├── 🌐 Website Management
│   ├── Site Pages
│   │   ├── Homepage
│   │   ├── Service Pages
│   │   ├── Fleet Gallery
│   │   ├── About Us
│   │   ├── Contact Page
│   │   ├── Testimonials
│   │   └── FAQ
│   │
│   ├── Content Management
│   │   ├── Airport Site
│   │   ├── Corporate Site
│   │   ├── Wedding Site
│   │   ├── Party Bus Site
│   │   └── Blog (Shared)
│   │
│   ├── SEO Management
│   │   ├── Meta Tags Editor
│   │   ├── Sitemap Generator
│   │   ├── Robots.txt Editor
│   │   ├── Canonical URLs
│   │   ├── Structured Data
│   │   └── SEO Analytics
│   │
│   └── Website Settings
│       ├── Domain Configuration
│       ├── Custom Branding
│       ├── Publishing Schedule
│       ├── Redirects
│       └── Maintenance Mode
│
├── 📚 Blog Management
│   ├── Blog Posts
│   │   ├── All Posts
│   │   ├── Drafts
│   │   ├── Scheduled
│   │   ├── Published
│   │   └── Archived
│   │
│   ├── Create Post
│   │   ├── Title & Slug
│   │   ├── Content Editor
│   │   ├── Featured Image
│   │   ├── Categories & Tags
│   │   ├── SEO Settings
│   │   └── Publish Settings
│   │
│   ├── Post Management
│   │   ├── Edit Post
│   │   ├── Bulk Publish
│   │   ├── Schedule Posts
│   │   ├── Categories
│   │   └── Tags
│   │
│   └── Blog Analytics
│       ├── Traffic by Post
│       ├── Top Posts
│       ├── Reader Engagement
│       └── Social Shares
│
├── 🖼️ Image Management
│   ├── Image Library
│   │   ├── All Images
│   │   ├── By Category
│   │   ├── By Entity Type
│   │   ├── Usage Tracking
│   │   └── Missing Images Alert
│   │
│   ├── Upload Images
│   │   ├── Single Upload
│   │   ├── Bulk Upload
│   │   ├── URL Import
│   │   └── Image Settings
│   │
│   ├── Image Editing
│   │   ├── Crop/Resize
│   │   ├── Add Alt Text
│   │   ├── Add Captions
│   │   ├── Compress
│   │   └── Format Conversion
│   │
│   ├── AI Image Management
│   │   ├── Generate Missing Images
│   │   ├── Batch Generation
│   │   ├── Generation Queue
│   │   ├── AI Settings
│   │   └── Generation History
│   │
│   └── Image Gallery
│       ├── Vehicle Photos
│       ├── Driver Profiles
│       ├── Blog Images
│       ├── Marketing Assets
│       └── Team Photos
│
├── 📊 Analytics & Reporting
│   ├── Dashboard Metrics
│   │   ├── Real-Time Stats
│   │   ├── Daily Summary
│   │   ├── Weekly Report
│   │   └── Monthly Report
│   │
│   ├── Reports
│   │   ├── Revenue Report
│   │   ├── Expense Report
│   │   ├── Driver Performance
│   │   ├── Vehicle Utilization
│   │   ├── Affiliate Performance
│   │   ├── Customer Metrics
│   │   ├── Booking Trends
│   │   └── SEO Performance
│   │
│   ├── Custom Reports
│   │   ├── Report Builder
│   │   ├── Saved Reports
│   │   ├── Scheduled Reports
│   │   └── Email Delivery
│   │
│   └── Data Export
│       ├── Export to CSV
│       ├── Export to Excel
│       ├── Export to PDF
│       └── Google Sheets Sync
│
├── 📥 Data Import
│   ├── Import Wizard
│   │   ├── File Upload
│   │   ├── Format Detection
│   │   ├── Column Mapping
│   │   ├── Data Validation
│   │   └── Preview
│   │
│   ├── Moovs CSV Import
│   │   ├── Upload CSV
│   │   ├── Map Columns
│   │   ├── Deduplication
│   │   ├── Validation Report
│   │   └── Import History
│   │
│   ├── Import History
│   │   ├── All Imports
│   │   ├── Successful Imports
│   │   ├── Failed Imports
│   │   └── Audit Trail
│   │
│   └── Import Settings
│       ├── Auto-Deduplicate
│       ├── Validation Rules
│       ├── Transformation Rules
│       └── Error Handling
│
├── 🤖 AI Copilots & Automation
│   ├── Dispatch Copilot
│   │   ├── Suggested Assignments
│   │   ├── Demand Prediction
│   │   ├── Conflict Detection
│   │   └── Pricing Recommendations
│   │
│   ├── Driver Copilot
│   │   ├── Performance Feedback
│   │   ├── Earnings Optimization
│   │   ├── Maintenance Alerts
│   │   └── Support
│   │
│   ├── Customer Chatbot
│   │   ├── Conversation History
│   │   ├── FAQ Management
│   │   ├── Escalation Handling
│   │   └── Performance Analytics
│   │
│   └── Automation Rules
│       ├── Scheduled Tasks
│       ├── Event Triggers
│       ├── Workflow Automation
│       └── Integration Webhooks
│
├── ⚙️ System Settings
│   ├── Organization
│   │   ├── Company Info
│   │   ├── Branding
│   │   ├── Domains
│   │   └── Logo/Favicon
│   │
│   ├── User Management
│   │   ├── Team Members
│   │   ├── Roles & Permissions
│   │   ├── Access Control
│   │   ├── User Activity Log
│   │   └── API Keys
│   │
│   ├── Billing & Subscription
│   │   ├── Plan Information
│   │   ├── Billing History
│   │   ├── Payment Method
│   │   ├── Upgrade/Downgrade
│   │   └── Usage Limits
│   │
│   ├── Payment Processing
│   │   ├── Stripe Configuration
│   │   ├── Square Configuration
│   │   ├── Webhook Settings
│   │   └── Tax Settings
│   │
│   ├── Email & SMS
│   │   ├── Email Templates
│   │   ├── SMS Templates
│   │   ├── Notification Settings
│   │   └── Opt-Out Management
│   │
│   ├── Integrations
│   │   ├── Connected Apps
│   │   ├── Google Maps
│   │   ├── Twilio
│   │   ├── SendGrid
│   │   ├── Google Analytics
│   │   ├── OpenAI/DALL-E
│   │   └── Custom Webhooks
│   │
│   ├── Security & Privacy
│   │   ├── Two-Factor Auth
│   │   ├── Session Management
│   │   ├── API Security
│   │   ├── Data Backup
│   │   └── GDPR Compliance
│   │
│   └── Advanced Settings
│       ├── Database Maintenance
│       ├── Cache Management
│       ├── Debug Mode
│       └── System Health
│
└── 👤 Account
    ├── Profile
    ├── Password
    ├── Preferences
    └── Logout
```

---

## 2. Driver App Navigation

```
DRIVER APP
│
├── 📍 Active Ride / Dispatch
│   ├── Map with Ride Details
│   │   ├── Current Location
│   │   ├── Pickup Location
│   │   ├── Dropoff Location
│   │   └── ETA
│   │
│   ├── Ride Information
│   │   ├── Customer Name
│   │   ├── Passenger Count
│   │   ├── Estimated Fare
│   │   ├── Customer Notes
│   │   └── Rating
│   │
│   ├── Actions
│   │   ├── Accept/Decline Ride
│   │   ├── Call Customer
│   │   ├── Message Customer
│   │   ├── Report Issue
│   │   └── Complete Ride
│   │
│   └── Real-Time Updates
│       ├── Navigation
│       ├── Traffic Alerts
│       ├── Customer Notifications
│       └── Time Updates
│
├── 📋 Ride History
│   ├── Today's Rides
│   ├── Past Rides
│   ├── Ride Details
│   ├── Earnings Summary
│   └── Customer Feedback
│
├── 💰 Earnings & Pay
│   ├── Today's Earnings
│   ├── Weekly Summary
│   ├── Monthly Summary
│   ├── Pay Schedule
│   ├── Pay Stubs
│   └── Deductions
│
├── 👤 Profile
│   ├── Personal Info
│   ├── Driver License
│   ├── Document Uploads
│   ├── Rating & Reviews
│   ├── Vehicle Assignment
│   └── Availability Settings
│
├── 🚗 Vehicle Info
│   ├── Assigned Vehicle
│   ├── Vehicle Details
│   ├── Maintenance Alerts
│   ├── Fuel Card
│   └── Document Expiration
│
├── 📞 Support
│   ├── Help & FAQ
│   ├── Contact Support
│   ├── Incident Report
│   ├── Safety Tools
│   └── Driver Resources
│
└── ⚙️ Settings
    ├── Availability
    ├── Notifications
    ├── Payment Method
    ├── Language
    └── Logout
```

---

## 3. Customer Portal Navigation

```
CUSTOMER PORTAL
│
├── 🏠 Home / Dashboard
│   ├── Quick Book Button
│   ├── Recent Rides
│   ├── Saved Addresses
│   ├── Account Status
│   └── Loyalty Points
│
├── 🚕 Book a Ride
│   ├── Pickup Location
│   ├── Dropoff Location
│   ├── Date & Time
│   ├── Vehicle Type
│   ├── Special Requests
│   ├── Price Quote
│   └── Payment Method
│
├── 📍 Active Ride Tracking
│   ├── Live Map
│   ├── Driver Info
│   ├── ETA
│   ├── Share Ride
│   ├── Call Driver
│   └── Safety Features
│
├── 📋 Ride History
│   ├── All Rides
│   ├── Upcoming Rides
│   ├── Past Rides
│   ├── Ride Details
│   ├── Receipts
│   └── Rate Driver
│
├── 💳 Payment & Billing
│   ├── Saved Payment Methods
│   ├── Add Payment Method
│   ├── Billing History
│   ├── Invoices
│   ├── Refunds
│   └── Payment Settings
│
├── 👤 Account
│   ├── Profile Info
│   ├── Saved Addresses
│   ├── Contact Info
│   ├── Password
│   ├── Preferences
│   └── Privacy Settings
│
├── 💎 Loyalty Program
│   ├── Points Balance
│   ├── Tier Status
│   ├── Rewards Catalog
│   ├── Redeem Rewards
│   └── Referral Program
│
├── 📞 Support
│   ├── Help & FAQ
│   ├── Contact Support
│   ├── Report Issue
│   ├── Feedback
│   └── FAQs
│
└── ⚙️ Settings
    ├── Notifications
    ├── Email Preferences
    ├── SMS Preferences
    ├── Privacy Settings
    └── Logout
```

---

## 4. Marketing Websites Structure

```
PUBLIC WEBSITES (5 Domains)
│
├── Homepage
│   ├── Hero Section (CTA)
│   ├── Services Overview
│   ├── Why Choose Us
│   ├── Testimonials
│   ├── Fleet Showcase
│   └── Call-to-Action (Book Now)
│
├── Services Pages
│   ├── Airport Transfers
│   ├── Corporate Services
│   ├── Wedding Transportation
│   ├── Party Bus Rentals
│   ├── Hourly Charters
│   └── Event Transportation
│
├── Fleet Pages
│   ├── All Vehicles
│   ├── By Type
│   │   ├── Sedans
│   │   ├── SUVs
│   │   ├── Luxury Limos
│   │   └── Party Buses
│   │
│   ├── Vehicle Details
│   │   ├── Photos
│   │   ├── Specifications
│   │   ├── Amenities
│   │   ├── Capacity
│   │   └── Pricing
│   │
│   └── Booking Form
│
├── City / Area Pages (Local SEO)
│   ├── Chicago Downtown
│   ├── O'Hare Airport
│   ├── Midway Airport
│   ├── Suburbs (Evanston, Skokie, etc.)
│   ├── Neighborhoods
│   └── Attractions
│
├── Pricing Pages
│   ├── Service Pricing
│   ├── Vehicle-Based Pricing
│   ├── Hourly Rates
│   ├── Package Deals
│   ├── Corporate Pricing
│   └── Bulk Booking Discounts
│
├── About Us
│   ├── Company Story
│   ├── Our Team
│   ├── Our Mission
│   ├── Awards & Recognition
│   └── Corporate Responsibility
│
├── Contact Page
│   ├── Contact Form
│   ├── Phone Number
│   ├── Email
│   ├── Office Locations
│   └── Live Chat
│
├── Blog
│   ├── All Posts
│   ├── By Category
│   │   ├── Travel Tips
│   │   ├── City Guides
│   │   ├── Fleet News
│   │   ├── Events
│   │   └── Company Updates
│   │
│   ├── Post Details
│   │   ├── Content
│   │   ├── Related Posts
│   │   ├── Comment Section
│   │   ├── Share Options
│   │   └── Author Bio
│   │
│   └── Search & Filter
│
├── FAQ
│   ├── Frequently Asked Questions
│   ├── By Category
│   ├── Search FAQ
│   └── Contact for More
│
├── Testimonials Page
│   ├── Customer Reviews
│   ├── By Rating
│   ├── Video Testimonials
│   └── Case Studies
│
├── Booking Widget
│   ├── Embedded on All Pages
│   ├── Quick Booking
│   ├── Location Autocomplete
│   ├── Vehicle Selection
│   ├── Price Estimate
│   └── Payment
│
├── Legal Pages
│   ├── Privacy Policy
│   ├── Terms of Service
│   ├── Cookie Policy
│   ├── Accessibility Statement
│   └── Company Info
│
└── Other Pages
    ├── Careers
    ├── Partnership
    ├── Corporate Accounts
    └── 404 / Error Page
```

---

## 5. Navigation Element States

### Desktop Navigation (Admin)
- Sidebar: Always visible (collapsible)
- Top bar: Logo, Search, Notifications, User Menu
- Breadcrumbs: Show current page path
- Help icon: Contextual help

### Mobile Navigation (Driver / Customer)
- Bottom tab bar: 4-5 main sections
- Hamburger menu: Secondary options
- Quick actions: Floating action buttons
- Back navigation: Clear path

### Responsive Breakpoints
```
- Mobile: < 640px (bottom navigation)
- Tablet: 640px - 1024px (mixed layout)
- Desktop: > 1024px (full sidebar navigation)
```

---

## 6. Key User Flows

### Booking Flow
```
Home → Book Now → Select Location → Select Vehicle → Enter Details → Confirm Price → Pay → Confirmation
```

### Ride Completion Flow
```
Dispatch → Driver Accepts → En Route to Pickup → Arrived → Customer Boards → En Route to Dropoff → Arrived → Complete → Payment → Rating
```

### Financial Close Flow
```
View Pay Period → Review Earnings → Approve Pay → Process Payment → Payment Confirmation → Pay Stub Generation
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Owner**: YOLO Autonomous Builder (Agent 1 - System Architect)
**Status**: Production Ready
