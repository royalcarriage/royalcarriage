# Design Guidelines: Chicago Airport Black Car

## Design Approach
**Reference-Based Approach**: Drawing from premium transportation services (Uber Black, Blacklane) and luxury service websites (Ritz-Carlton, Four Seasons) with conversion optimization from Stripe and Linear. This is a high-intent conversion site with luxury positioning - every design decision serves immediate booking or call conversion.

## Core Design Principles
1. **Trust & Professionalism First**: Visual hierarchy emphasizes credibility signals
2. **Conversion-Optimized**: Clear CTAs, minimal friction, immediate action
3. **Premium Positioning**: Refined without being ostentatious
4. **Speed & Performance**: Clean layouts, minimal animations, fast load

## Typography
- **Primary Font**: Inter or DM Sans (Google Fonts) - professional, modern, highly legible
- **Heading Hierarchy**: 
  - H1: 48px (mobile: 32px), font-weight 700
  - H2: 36px (mobile: 28px), font-weight 600
  - H3: 24px (mobile: 20px), font-weight 600
  - Body: 16px, font-weight 400, line-height 1.6
- **CTA Buttons**: 16px, font-weight 600, uppercase letter-spacing

## Layout System
**Spacing Units**: Tailwind units of 4, 6, 8, 12, 16, 20, 24 (consistent rhythm)
- Section padding: py-16 md:py-24
- Container max-width: max-w-7xl with px-6 md:px-8
- Component spacing: space-y-8 to space-y-12
- Grid gaps: gap-6 to gap-8

## Component Library

### Navigation
- Sticky header with white background, subtle shadow on scroll
- Logo left, navigation center/right, phone + Book Now button right
- Mobile: Hamburger menu with full-screen overlay

### Hero Sections
**Homepage Hero**:
- Full-width hero with background image (luxury black car at O'Hare/Midway terminal)
- Semi-transparent dark overlay (opacity-50) for text legibility
- Centered content: H1, subheading, trust bullets (4 items with checkmarks), dual CTAs
- CTAs: "Call Now" (primary) + "Book Now" (secondary) with blur backdrop
- Height: min-h-[600px] md:min-h-[700px]

**Service Page Heroes**:
- Similar structure but airport-specific imagery
- Breadcrumb navigation below header

### Trust Elements
- Icon + text bullets in grid (2 columns mobile, 4 columns desktop)
- Simple line icons from Heroicons
- Subtle background cards with border

### Service Cards
- 2-column grid (mobile: 1 column)
- Card structure: Image top, title, 2-3 line description, "Learn More" link
- Hover: Subtle lift (translate-y-1) and shadow increase

### Fleet Display
- Horizontal cards with image left, specs right (stacked on mobile)
- Key specs: Passengers, Luggage, Features
- "Get Quote" CTA per vehicle

### CTAs Throughout
- Primary: Black background, white text
- Secondary: White background, black text, black border
- Both: Rounded corners (rounded-lg), padding py-3 px-8
- Spacing: Place CTA every 2-3 sections as specified

### Sticky Mobile Bar
- Fixed bottom bar (z-50)
- 50/50 split: "Call Now" (left) | "Book Now" (right)
- Backdrop blur with semi-transparent white background
- Always visible on mobile (<768px)

### Footer
- 3-column layout (mobile: stacked)
- Column 1: Logo, tagline, phone
- Column 2: Quick links (services, fleet, about, contact)
- Column 3: Service areas list
- Bottom bar: Copyright, terms, privacy
- Background: Subtle gray (bg-gray-50)

## Images
**Required Images**:
1. **Homepage Hero**: Professional black SUV at airport terminal (night/dusk lighting preferred for luxury feel)
2. **O'Hare Page**: Specific O'Hare terminal with black car in foreground
3. **Midway Page**: Midway terminal with vehicle
4. **Fleet Section**: 
   - Black SUV (Suburban/Escalade style): 3/4 front angle, clean studio or airport setting
   - Black Sedan (luxury sedan): Similar angle and setting
5. **Service Cards**: Smaller supporting images for each service area (Downtown skyline, suburban area, etc.)

**Image Treatment**: All hero images use dark overlay (bg-black/50) for text contrast. Fleet images on clean white backgrounds. Service card images subtle and supporting.

## Color Palette (Described for Context Only)
- Monochromatic scheme with black, white, and neutral grays
- Accent color for trust elements (subtle blue or gold)
- High contrast for accessibility and professionalism

## Animations
**Minimal & Purposeful**:
- Smooth scroll behavior
- CTA hover states (scale-105, subtle transitions)
- Card hover lifts (translate-y-1)
- No auto-play carousels, no scroll animations
- Transition duration: 200-300ms

## SEO & Content Structure
- Clear heading hierarchy on every page
- Phone number in multiple formats: clickable header, hero, footer
- Structured data placeholders (LocalBusiness schema ready)
- Internal linking between airport service pages
- Money pages: 800-1200 words with CTAs every 2-3 sections (3-4 paragraph blocks)

## Mobile-First Specifics
- Touch targets minimum 44x44px
- Sticky mobile CTA bar always visible
- Click-to-call phone numbers
- Simplified navigation for mobile
- Single column layouts below 768px
- Larger tap areas for primary CTAs

## Page-Specific Layouts
**Homepage**: Hero → Trust Bullets → Services Grid (4 cards) → Fleet Preview (2 vehicles) → Final Conversion CTA

**Service Pages**: Hero → Intro Paragraph → Key Benefits (icon bullets) → Detailed Content (800-1200 words with CTAs interspersed) → Related Services → Final CTA

**Fleet**: Hero → Vehicle Cards (2-3 detailed) → Booking CTA

**Pricing**: Simple section-based layout, transparent flat-rate messaging, strong CTA

**Contact**: 2-column (Form left, Info right) with phone prominent

This design creates a premium, trustworthy experience optimized for immediate conversions while maintaining fast load times and mobile excellence.