// Firebase Storage image URLs for Royal Carriage sites
const STORAGE_BASE =
  "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o";

function storageUrl(path: string): string {
  return `${STORAGE_BASE}/${encodeURIComponent(path)}?alt=media`;
}

export interface SiteImages {
  hero: {
    main: string;
    secondary?: string;
    tertiary?: string;
  };
  fleet: {
    sedan: string;
    suv: string;
    van?: string;
    limo?: string;
    partybus?: string;
  };
  supporting: {
    image1?: string;
    image2?: string;
    image3?: string;
  };
  og: string;
  services?: Record<string, string>;
  locations?: Record<string, string>;
}

export const SITE_IMAGES: Record<string, SiteImages> = {
  airport: {
    hero: {
      main: storageUrl(
        "site-assets/airport/images/hero/airport-hero-1/airport-hero-1-1600.webp",
      ),
      secondary: storageUrl(
        "site-assets/airport/images/hero/airport-hero-2/airport-hero-2-1600.webp",
      ),
      tertiary: storageUrl(
        "site-assets/airport/images/hero/airport-hero-3/airport-hero-3-1600.webp",
      ),
    },
    fleet: {
      sedan: storageUrl("site-assets/airport/images/fleet/black-sedan.webp"),
      suv: storageUrl("site-assets/airport/images/fleet/black-suv.webp"),
      van: storageUrl(
        "site-assets/airport/images/fleet/a3len363ggq/a3len363ggq-1024.webp",
      ),
    },
    supporting: {
      image1: storageUrl(
        "site-assets/airport/images/airport/supporting-1.webp",
      ),
      image2: storageUrl(
        "site-assets/airport/images/airport/supporting-2.webp",
      ),
    },
    og: storageUrl("site-assets/airport/images/og-default.jpg"),
    services: {
      ohare: storageUrl(
        "site-assets/airport/images/airports/dpwwav9dhkk/dpwwav9dhkk-1600.webp",
      ),
      midway: storageUrl(
        "site-assets/airport/images/airports/fzpyucv5hys/fzpyucv5hys-1600.webp",
      ),
      downtown: storageUrl(
        "site-assets/airport/images/chicago/ff6mptsctqm/ff6mptsctqm-1600.webp",
      ),
      suburbs: storageUrl(
        "site-assets/airport/images/suburbs/1qzcq5mnw2o/1qzcq5mnw2o-1600.webp",
      ),
    },
    locations: {
      chicago: storageUrl(
        "site-assets/airport/images/chicago/nsan3nsw5t0/nsan3nsw5t0-1600.webp",
      ),
      background: storageUrl(
        "site-assets/airport/images/backgrounds/sfxao_7m-0e/sfxao_7m-0e-1600.webp",
      ),
    },
  },
  corporate: {
    hero: {
      main: storageUrl(
        "site-assets/corporate/images/hero/corporate-hero-1/corporate-hero-1-1600.webp",
      ),
      secondary: storageUrl(
        "site-assets/corporate/images/hero/corporate-hero-2/corporate-hero-2-1600.webp",
      ),
      tertiary: storageUrl(
        "site-assets/corporate/images/hero/corporate-hero-3/corporate-hero-3-1600.webp",
      ),
    },
    fleet: {
      sedan: storageUrl(
        "site-assets/corporate/images/corporate/fleet-sedan.webp",
      ),
      suv: storageUrl("site-assets/corporate/images/corporate/fleet-suv.webp"),
    },
    supporting: {
      image1: storageUrl(
        "site-assets/corporate/images/corporate/supporting-1.webp",
      ),
      image2: storageUrl(
        "site-assets/corporate/images/corporate/supporting-2.webp",
      ),
    },
    og: storageUrl("site-assets/corporate/images/og-default.jpg"),
  },
  wedding: {
    hero: {
      main: storageUrl(
        "site-assets/wedding/images/hero/wedding-hero-1/wedding-hero-1-1600.webp",
      ),
      secondary: storageUrl(
        "site-assets/wedding/images/hero/wedding-hero-2/wedding-hero-2-1600.webp",
      ),
      tertiary: storageUrl(
        "site-assets/wedding/images/hero/wedding-hero-3/wedding-hero-3-1600.webp",
      ),
    },
    fleet: {
      sedan: storageUrl("site-assets/wedding/images/wedding/fleet-sedan.webp"),
      suv: storageUrl("site-assets/wedding/images/wedding/fleet-suv.webp"),
    },
    supporting: {
      image1: storageUrl(
        "site-assets/wedding/images/wedding/supporting-1.webp",
      ),
      image2: storageUrl(
        "site-assets/wedding/images/wedding/supporting-2.webp",
      ),
    },
    og: storageUrl("site-assets/wedding/images/og-default.jpg"),
  },
  partybus: {
    hero: {
      main: storageUrl(
        "site-assets/partybus/images/hero/partybus-hero-1/partybus-hero-1-1600.webp",
      ),
      secondary: storageUrl(
        "site-assets/partybus/images/hero/partybus-hero-2/partybus-hero-2-1600.webp",
      ),
      tertiary: storageUrl(
        "site-assets/partybus/images/hero/partybus-hero-3/partybus-hero-3-1600.webp",
      ),
    },
    fleet: {
      sedan: storageUrl(
        "site-assets/partybus/images/partybus/fleet-sedan.webp",
      ),
      suv: storageUrl("site-assets/partybus/images/partybus/fleet-suv.webp"),
      partybus: storageUrl(
        "site-assets/partybus/images/partybus/interior.webp",
      ),
    },
    supporting: {
      image1: storageUrl(
        "site-assets/partybus/images/partybus/supporting-1.webp",
      ),
      image2: storageUrl(
        "site-assets/partybus/images/partybus/supporting-2.webp",
      ),
      image3: storageUrl("site-assets/partybus/images/partybus/nightlife.webp"),
    },
    og: storageUrl("site-assets/partybus/images/og-default.jpg"),
  },
};

export function getSiteImages(target: string): SiteImages {
  return SITE_IMAGES[target] || SITE_IMAGES.airport;
}

export function getResponsiveImageSet(basePath: string): {
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  // Extract the base without size suffix
  const pathParts = basePath.split("/");
  const folder = pathParts.slice(0, -1).join("/");
  const fileName = pathParts[pathParts.length - 1]
    .replace(/-\d+\.webp$/, "")
    .replace(".webp", "");

  return {
    small: storageUrl(`${folder}/${fileName}-320.webp`),
    medium: storageUrl(`${folder}/${fileName}-640.webp`),
    large: storageUrl(`${folder}/${fileName}-1024.webp`),
    original: storageUrl(`${folder}/${fileName}-1600.webp`),
  };
}

export { storageUrl };
