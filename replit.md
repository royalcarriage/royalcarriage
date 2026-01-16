# Chicago Airport Black Car

## Overview

A professional SEO-first website for Chicago Airport Black Car service, designed to convert visitors into phone calls and Moovs bookings. Built with React, TypeScript, and Tailwind CSS.

## Business Details

- **Business Name**: Chicago Airport Black Car (Royal Carriage Limousine)
- **Phone**: +1 (224) 801-3090 (click-to-call: `tel:+12248013090`)
- **Booking URL**: https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites
- **Domain**: chicagoairportblackcar.com
- **Firebase Project**: royalcarriagelimoseo

## Pages (Firebase URL Structure)

- `/` - Home page with hero, services, fleet, comparison, FAQ sections
- `/ohare-airport-limo` - O'Hare Airport service (800+ words SEO content)
- `/midway-airport-limo` - Midway Airport service (800+ words SEO content)
- `/airport-limo-downtown-chicago` - Downtown Chicago transfers
- `/airport-limo-suburbs` - Suburban airport service
- `/fleet` - Vehicle fleet display
- `/pricing` - Pricing information
- `/about` - Company information
- `/contact` - Contact page with phone and booking CTAs
- `/city/:slug` - 35 city-specific pages for Chicago suburbs

## City Pages (35 Suburbs)

**North Shore**: Evanston, Skokie, Wilmette, Glenview, Northbrook, Highland Park, Lake Forest, Winnetka, Deerfield, Glencoe, Libertyville, Vernon Hills, Buffalo Grove, Lincolnshire

**West Suburbs**: Naperville, Oak Brook, Downers Grove, Elmhurst, Wheaton, Glen Ellyn, Lombard, Hinsdale, Clarendon Hills, Westmont, Lisle, Woodridge, Burr Ridge, Oak Park, River Forest

**Northwest Suburbs**: Schaumburg, Arlington Heights, Palatine, Hoffman Estates

**South Suburbs**: Orland Park, Oak Lawn, Tinley Park, Homer Glen, Frankfort, Mokena, Palos Heights

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Sticky navigation
│   │   │   ├── Footer.tsx      # 3-column footer with Popular Cities
│   │   │   ├── MobileCTABar.tsx # Fixed mobile bottom bar
│   │   │   └── Layout.tsx      # Page wrapper
│   │   ├── Hero.tsx            # Reusable hero section
│   │   ├── ServiceCard.tsx     # Service display card
│   │   ├── FleetCard.tsx       # Vehicle display card
│   │   ├── CTASection.tsx      # Call-to-action section
│   │   └── SEO.tsx             # Per-page SEO metadata
│   ├── data/
│   │   └── cities.ts           # 35 Chicago suburb data
│   ├── pages/
│   │   ├── Home.tsx            # Homepage with FAQ & comparison
│   │   ├── CityPage.tsx        # Dynamic city page template
│   │   └── ...                 # All other pages
│   └── App.tsx                 # Router configuration
```

## Key Features

- **SEO-Optimized**: Unique title, description, canonical URL per page via react-helmet-async
- **UTM Tracking**: All booking links include `?utm_source=airport&utm_medium=seo&utm_campaign=microsites`
- **35 City Pages**: Dynamic suburb pages with local SEO content
- **FAQ Section**: 10-item accordion on homepage
- **Comparison Section**: "Black car vs Uber/taxi" value proposition
- **Mobile-first**: Sticky mobile CTA bar (visible < 768px)
- **Firebase Ready**: Configured for Firebase Hosting deployment

## Design Guidelines

- **Style**: Clean, luxury, black/white/neutral tones
- **Font**: DM Sans
- **CTAs**: Phone call and Moovs booking links with UTM tracking

## Firebase Deployment

Project configured for Firebase Hosting:

- `firebase.json` - Hosting config with SPA rewrites
- `.firebaserc` - Project ID: royalcarriagelimoseo
- Build output: `dist/public`

To deploy:

```bash
firebase login --no-localhost
firebase deploy
```

## Development

- Run `npm run dev` to start the development server
- Run `npm run build` to create production build
- The app runs on port 5000
