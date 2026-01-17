/**
 * Initialize All Firestore Data
 * Locations, Services, and Fleet Vehicles for Royal Carriage Limousine
 */

const admin = require("firebase-admin");

// Initialize with application default credentials
admin.initializeApp({
  projectId: "royalcarriagelimoseo",
});

const db = admin.firestore();

// ============================================
// LOCATIONS DATA (205 total)
// ============================================
const chicagoNeighborhoods = [
  // Downtown & Near North
  {
    slug: "loop",
    name: "The Loop",
    region: "downtown",
    type: "neighborhood",
    coordinates: { lat: 41.8819, lng: -87.6278 },
  },
  {
    slug: "river-north",
    name: "River North",
    region: "downtown",
    type: "neighborhood",
    coordinates: { lat: 41.8925, lng: -87.6341 },
  },
  {
    slug: "gold-coast",
    name: "Gold Coast",
    region: "downtown",
    type: "neighborhood",
    coordinates: { lat: 41.9044, lng: -87.6289 },
  },
  {
    slug: "streeterville",
    name: "Streeterville",
    region: "downtown",
    type: "neighborhood",
    coordinates: { lat: 41.8925, lng: -87.6189 },
  },
  {
    slug: "magnificent-mile",
    name: "Magnificent Mile",
    region: "downtown",
    type: "neighborhood",
    coordinates: { lat: 41.895, lng: -87.6245 },
  },
  {
    slug: "west-loop",
    name: "West Loop",
    region: "downtown",
    type: "neighborhood",
    coordinates: { lat: 41.8827, lng: -87.6505 },
  },
  {
    slug: "south-loop",
    name: "South Loop",
    region: "downtown",
    type: "neighborhood",
    coordinates: { lat: 41.8569, lng: -87.6247 },
  },
  {
    slug: "old-town",
    name: "Old Town",
    region: "near-north",
    type: "neighborhood",
    coordinates: { lat: 41.9111, lng: -87.6369 },
  },

  // North Side
  {
    slug: "lincoln-park",
    name: "Lincoln Park",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9214, lng: -87.6513 },
  },
  {
    slug: "lakeview",
    name: "Lakeview",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9434, lng: -87.6553 },
  },
  {
    slug: "wrigleyville",
    name: "Wrigleyville",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9484, lng: -87.6553 },
  },
  {
    slug: "lincoln-square",
    name: "Lincoln Square",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9692, lng: -87.6892 },
  },
  {
    slug: "andersonville",
    name: "Andersonville",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.98, lng: -87.6683 },
  },
  {
    slug: "edgewater",
    name: "Edgewater",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9839, lng: -87.66 },
  },
  {
    slug: "rogers-park",
    name: "Rogers Park",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 42.0087, lng: -87.6676 },
  },
  {
    slug: "uptown",
    name: "Uptown",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9656, lng: -87.6536 },
  },
  {
    slug: "ravenswood",
    name: "Ravenswood",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9742, lng: -87.6753 },
  },
  {
    slug: "albany-park",
    name: "Albany Park",
    region: "north",
    type: "neighborhood",
    coordinates: { lat: 41.9681, lng: -87.7239 },
  },

  // Northwest Side
  {
    slug: "wicker-park",
    name: "Wicker Park",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9088, lng: -87.6796 },
  },
  {
    slug: "bucktown",
    name: "Bucktown",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9214, lng: -87.6796 },
  },
  {
    slug: "logan-square",
    name: "Logan Square",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9234, lng: -87.7089 },
  },
  {
    slug: "humboldt-park",
    name: "Humboldt Park",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9023, lng: -87.7187 },
  },
  {
    slug: "ukrainian-village",
    name: "Ukrainian Village",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.8989, lng: -87.6847 },
  },
  {
    slug: "avondale",
    name: "Avondale",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9392, lng: -87.7108 },
  },
  {
    slug: "irving-park",
    name: "Irving Park",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9536, lng: -87.7356 },
  },
  {
    slug: "portage-park",
    name: "Portage Park",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9592, lng: -87.7653 },
  },
  {
    slug: "jefferson-park",
    name: "Jefferson Park",
    region: "northwest",
    type: "neighborhood",
    coordinates: { lat: 41.9706, lng: -87.7606 },
  },

  // West Side
  {
    slug: "pilsen",
    name: "Pilsen",
    region: "west",
    type: "neighborhood",
    coordinates: { lat: 41.8525, lng: -87.6563 },
  },
  {
    slug: "little-italy",
    name: "Little Italy",
    region: "west",
    type: "neighborhood",
    coordinates: { lat: 41.8686, lng: -87.6558 },
  },
  {
    slug: "garfield-park",
    name: "Garfield Park",
    region: "west",
    type: "neighborhood",
    coordinates: { lat: 41.8814, lng: -87.7178 },
  },
  {
    slug: "austin",
    name: "Austin",
    region: "west",
    type: "neighborhood",
    coordinates: { lat: 41.8956, lng: -87.7653 },
  },
  {
    slug: "oak-park-border",
    name: "Oak Park Border",
    region: "west",
    type: "neighborhood",
    coordinates: { lat: 41.885, lng: -87.79 },
  },

  // South Side
  {
    slug: "hyde-park",
    name: "Hyde Park",
    region: "south",
    type: "neighborhood",
    coordinates: { lat: 41.7943, lng: -87.5907 },
  },
  {
    slug: "bronzeville",
    name: "Bronzeville",
    region: "south",
    type: "neighborhood",
    coordinates: { lat: 41.8231, lng: -87.6186 },
  },
  {
    slug: "kenwood",
    name: "Kenwood",
    region: "south",
    type: "neighborhood",
    coordinates: { lat: 41.8097, lng: -87.5936 },
  },
  {
    slug: "bridgeport",
    name: "Bridgeport",
    region: "south",
    type: "neighborhood",
    coordinates: { lat: 41.8381, lng: -87.6506 },
  },
  {
    slug: "chinatown",
    name: "Chinatown",
    region: "south",
    type: "neighborhood",
    coordinates: { lat: 41.8517, lng: -87.6336 },
  },
  {
    slug: "beverly",
    name: "Beverly",
    region: "south",
    type: "neighborhood",
    coordinates: { lat: 41.7153, lng: -87.6678 },
  },
  {
    slug: "mount-greenwood",
    name: "Mount Greenwood",
    region: "south",
    type: "neighborhood",
    coordinates: { lat: 41.6989, lng: -87.7108 },
  },

  // Southwest Side
  {
    slug: "midway-area",
    name: "Midway Area",
    region: "southwest",
    type: "neighborhood",
    coordinates: { lat: 41.7868, lng: -87.7522 },
  },
  {
    slug: "clearing",
    name: "Clearing",
    region: "southwest",
    type: "neighborhood",
    coordinates: { lat: 41.7817, lng: -87.7633 },
  },
  {
    slug: "garfield-ridge",
    name: "Garfield Ridge",
    region: "southwest",
    type: "neighborhood",
    coordinates: { lat: 41.7953, lng: -87.7653 },
  },
  {
    slug: "archer-heights",
    name: "Archer Heights",
    region: "southwest",
    type: "neighborhood",
    coordinates: { lat: 41.8081, lng: -87.7239 },
  },
  {
    slug: "marquette-park",
    name: "Marquette Park",
    region: "southwest",
    type: "neighborhood",
    coordinates: { lat: 41.7656, lng: -87.6947 },
  },
];

const northernSuburbs = [
  {
    slug: "evanston",
    name: "Evanston",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0451, lng: -87.6877 },
  },
  {
    slug: "skokie",
    name: "Skokie",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0324, lng: -87.7416 },
  },
  {
    slug: "wilmette",
    name: "Wilmette",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0722, lng: -87.7239 },
  },
  {
    slug: "winnetka",
    name: "Winnetka",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1061, lng: -87.7359 },
  },
  {
    slug: "kenilworth",
    name: "Kenilworth",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0856, lng: -87.7173 },
  },
  {
    slug: "glencoe",
    name: "Glencoe",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.135, lng: -87.7598 },
  },
  {
    slug: "highland-park",
    name: "Highland Park",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1817, lng: -87.8003 },
  },
  {
    slug: "lake-forest",
    name: "Lake Forest",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.2586, lng: -87.8407 },
  },
  {
    slug: "deerfield",
    name: "Deerfield",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1711, lng: -87.8445 },
  },
  {
    slug: "northbrook",
    name: "Northbrook",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1275, lng: -87.8289 },
  },
  {
    slug: "glenview",
    name: "Glenview",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0698, lng: -87.7878 },
  },
  {
    slug: "morton-grove",
    name: "Morton Grove",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0401, lng: -87.7823 },
  },
  {
    slug: "niles",
    name: "Niles",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0189, lng: -87.8028 },
  },
  {
    slug: "park-ridge",
    name: "Park Ridge",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0111, lng: -87.8406 },
  },
  {
    slug: "des-plaines",
    name: "Des Plaines",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0334, lng: -87.8834 },
  },
  {
    slug: "mount-prospect",
    name: "Mount Prospect",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0664, lng: -87.9373 },
  },
  {
    slug: "arlington-heights",
    name: "Arlington Heights",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.0884, lng: -87.9806 },
  },
  {
    slug: "palatine",
    name: "Palatine",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1103, lng: -88.034 },
  },
  {
    slug: "buffalo-grove",
    name: "Buffalo Grove",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1514, lng: -87.9631 },
  },
  {
    slug: "wheeling",
    name: "Wheeling",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1392, lng: -87.9289 },
  },
  {
    slug: "lincolnshire",
    name: "Lincolnshire",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.19, lng: -87.9089 },
  },
  {
    slug: "vernon-hills",
    name: "Vernon Hills",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.2192, lng: -87.9795 },
  },
  {
    slug: "libertyville",
    name: "Libertyville",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.2831, lng: -87.9531 },
  },
  {
    slug: "mundelein",
    name: "Mundelein",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.2631, lng: -88.0034 },
  },
  {
    slug: "lake-zurich",
    name: "Lake Zurich",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1967, lng: -88.0934 },
  },
  {
    slug: "barrington",
    name: "Barrington",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1539, lng: -88.1367 },
  },
  {
    slug: "long-grove",
    name: "Long Grove",
    region: "north-suburb",
    type: "suburb",
    coordinates: { lat: 42.1786, lng: -88.0078 },
  },
];

const westernSuburbs = [
  {
    slug: "oak-park",
    name: "Oak Park",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.885, lng: -87.7845 },
  },
  {
    slug: "river-forest",
    name: "River Forest",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8978, lng: -87.814 },
  },
  {
    slug: "forest-park",
    name: "Forest Park",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8795, lng: -87.8134 },
  },
  {
    slug: "maywood",
    name: "Maywood",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8792, lng: -87.8431 },
  },
  {
    slug: "elmhurst",
    name: "Elmhurst",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8995, lng: -87.9403 },
  },
  {
    slug: "lombard",
    name: "Lombard",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.88, lng: -88.0078 },
  },
  {
    slug: "villa-park",
    name: "Villa Park",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8895, lng: -87.9789 },
  },
  {
    slug: "glen-ellyn",
    name: "Glen Ellyn",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8775, lng: -88.067 },
  },
  {
    slug: "wheaton",
    name: "Wheaton",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8661, lng: -88.107 },
  },
  {
    slug: "carol-stream",
    name: "Carol Stream",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.9125, lng: -88.1348 },
  },
  {
    slug: "bloomingdale",
    name: "Bloomingdale",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.9575, lng: -88.0809 },
  },
  {
    slug: "addison",
    name: "Addison",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.9317, lng: -88.0087 },
  },
  {
    slug: "bensenville",
    name: "Bensenville",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.955, lng: -87.9403 },
  },
  {
    slug: "wood-dale",
    name: "Wood Dale",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.9633, lng: -87.9789 },
  },
  {
    slug: "itasca",
    name: "Itasca",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.975, lng: -88.0073 },
  },
  {
    slug: "roselle",
    name: "Roselle",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.9842, lng: -88.0795 },
  },
  {
    slug: "schaumburg",
    name: "Schaumburg",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 42.0334, lng: -88.0834 },
  },
  {
    slug: "hoffman-estates",
    name: "Hoffman Estates",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 42.0628, lng: -88.1295 },
  },
  {
    slug: "streamwood",
    name: "Streamwood",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 42.0256, lng: -88.1784 },
  },
  {
    slug: "hanover-park",
    name: "Hanover Park",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.9994, lng: -88.1451 },
  },
  {
    slug: "bartlett",
    name: "Bartlett",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.995, lng: -88.1856 },
  },
  {
    slug: "st-charles",
    name: "St. Charles",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.9142, lng: -88.3087 },
  },
  {
    slug: "geneva",
    name: "Geneva",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8875, lng: -88.3054 },
  },
  {
    slug: "batavia",
    name: "Batavia",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8503, lng: -88.3126 },
  },
  {
    slug: "aurora",
    name: "Aurora",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7606, lng: -88.3201 },
  },
  {
    slug: "naperville",
    name: "Naperville",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7508, lng: -88.1535 },
  },
  {
    slug: "lisle",
    name: "Lisle",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8011, lng: -88.0748 },
  },
  {
    slug: "downers-grove",
    name: "Downers Grove",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8089, lng: -88.0112 },
  },
  {
    slug: "westmont",
    name: "Westmont",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7958, lng: -87.9756 },
  },
  {
    slug: "clarendon-hills",
    name: "Clarendon Hills",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7975, lng: -87.9545 },
  },
  {
    slug: "hinsdale",
    name: "Hinsdale",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8008, lng: -87.937 },
  },
  {
    slug: "oak-brook",
    name: "Oak Brook",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8328, lng: -87.929 },
  },
  {
    slug: "western-springs",
    name: "Western Springs",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8097, lng: -87.9006 },
  },
  {
    slug: "la-grange",
    name: "La Grange",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.805, lng: -87.8692 },
  },
  {
    slug: "la-grange-park",
    name: "La Grange Park",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.835, lng: -87.8692 },
  },
  {
    slug: "brookfield",
    name: "Brookfield",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8231, lng: -87.8473 },
  },
  {
    slug: "riverside",
    name: "Riverside",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.835, lng: -87.8231 },
  },
  {
    slug: "berwyn",
    name: "Berwyn",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8506, lng: -87.7936 },
  },
  {
    slug: "cicero",
    name: "Cicero",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.8456, lng: -87.7539 },
  },
  {
    slug: "burr-ridge",
    name: "Burr Ridge",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7489, lng: -87.9195 },
  },
  {
    slug: "willowbrook",
    name: "Willowbrook",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7697, lng: -87.9359 },
  },
  {
    slug: "darien",
    name: "Darien",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7519, lng: -87.9734 },
  },
  {
    slug: "woodridge",
    name: "Woodridge",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.7469, lng: -88.0503 },
  },
  {
    slug: "bolingbrook",
    name: "Bolingbrook",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.6986, lng: -88.0684 },
  },
  {
    slug: "romeoville",
    name: "Romeoville",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.6475, lng: -88.0895 },
  },
  {
    slug: "plainfield",
    name: "Plainfield",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.6269, lng: -88.2037 },
  },
  {
    slug: "oswego",
    name: "Oswego",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.6828, lng: -88.3515 },
  },
  {
    slug: "yorkville",
    name: "Yorkville",
    region: "west-suburb",
    type: "suburb",
    coordinates: { lat: 41.6414, lng: -88.4473 },
  },
];

const southernSuburbs = [
  {
    slug: "oak-lawn",
    name: "Oak Lawn",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.7139, lng: -87.7584 },
  },
  {
    slug: "evergreen-park",
    name: "Evergreen Park",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.7206, lng: -87.7017 },
  },
  {
    slug: "orland-park",
    name: "Orland Park",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6303, lng: -87.8539 },
  },
  {
    slug: "tinley-park",
    name: "Tinley Park",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5731, lng: -87.7845 },
  },
  {
    slug: "palos-heights",
    name: "Palos Heights",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6681, lng: -87.7959 },
  },
  {
    slug: "palos-hills",
    name: "Palos Hills",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6967, lng: -87.8184 },
  },
  {
    slug: "palos-park",
    name: "Palos Park",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6672, lng: -87.8334 },
  },
  {
    slug: "mokena",
    name: "Mokena",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5261, lng: -87.8892 },
  },
  {
    slug: "frankfort",
    name: "Frankfort",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.4956, lng: -87.8487 },
  },
  {
    slug: "new-lenox",
    name: "New Lenox",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5119, lng: -87.9656 },
  },
  {
    slug: "homer-glen",
    name: "Homer Glen",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6, lng: -87.937 },
  },
  {
    slug: "lemont",
    name: "Lemont",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6736, lng: -88.0017 },
  },
  {
    slug: "lockport",
    name: "Lockport",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5894, lng: -88.0573 },
  },
  {
    slug: "joliet",
    name: "Joliet",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.525, lng: -88.0817 },
  },
  {
    slug: "shorewood",
    name: "Shorewood",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.52, lng: -88.2017 },
  },
  {
    slug: "crest-hill",
    name: "Crest Hill",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5547, lng: -88.0987 },
  },
  {
    slug: "blue-island",
    name: "Blue Island",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6572, lng: -87.68 },
  },
  {
    slug: "calumet-city",
    name: "Calumet City",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6156, lng: -87.5295 },
  },
  {
    slug: "lansing",
    name: "Lansing",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5647, lng: -87.5389 },
  },
  {
    slug: "homewood",
    name: "Homewood",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5572, lng: -87.6656 },
  },
  {
    slug: "flossmoor",
    name: "Flossmoor",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5428, lng: -87.6828 },
  },
  {
    slug: "olympia-fields",
    name: "Olympia Fields",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5131, lng: -87.6834 },
  },
  {
    slug: "park-forest",
    name: "Park Forest",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.4914, lng: -87.6744 },
  },
  {
    slug: "matteson",
    name: "Matteson",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5089, lng: -87.7131 },
  },
  {
    slug: "richton-park",
    name: "Richton Park",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.4842, lng: -87.7334 },
  },
  {
    slug: "country-club-hills",
    name: "Country Club Hills",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5681, lng: -87.7206 },
  },
  {
    slug: "hazel-crest",
    name: "Hazel Crest",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.5717, lng: -87.6945 },
  },
  {
    slug: "harvey",
    name: "Harvey",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.61, lng: -87.6467 },
  },
  {
    slug: "dolton",
    name: "Dolton",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6389, lng: -87.6073 },
  },
  {
    slug: "south-holland",
    name: "South Holland",
    region: "south-suburb",
    type: "suburb",
    coordinates: { lat: 41.6006, lng: -87.607 },
  },
];

const airports = [
  {
    slug: "ohare-airport",
    name: "O'Hare International Airport",
    region: "airport",
    type: "airport",
    code: "ORD",
    coordinates: { lat: 41.9742, lng: -87.9073 },
  },
  {
    slug: "midway-airport",
    name: "Midway International Airport",
    region: "airport",
    type: "airport",
    code: "MDW",
    coordinates: { lat: 41.7868, lng: -87.7522 },
  },
];

// Combine all locations
const allLocations = [
  ...chicagoNeighborhoods,
  ...northernSuburbs,
  ...westernSuburbs,
  ...southernSuburbs,
  ...airports,
];

// ============================================
// SERVICES DATA (91 total)
// ============================================
const services = [
  // Airport Services (20)
  {
    slug: "airport-transfer",
    name: "Airport Transfer",
    category: "airport",
    websites: ["airport"],
    description: "Premium airport pickup and drop-off service",
  },
  {
    slug: "ohare-limo",
    name: "O'Hare Limo Service",
    category: "airport",
    websites: ["airport"],
    description: "Luxury limousine service to/from O'Hare",
  },
  {
    slug: "midway-limo",
    name: "Midway Limo Service",
    category: "airport",
    websites: ["airport"],
    description: "Luxury limousine service to/from Midway",
  },
  {
    slug: "corporate-airport",
    name: "Corporate Airport Transfer",
    category: "airport",
    websites: ["airport", "corporate"],
    description: "Executive airport transportation",
  },
  {
    slug: "group-airport-shuttle",
    name: "Group Airport Shuttle",
    category: "airport",
    websites: ["airport"],
    description: "Group transportation to airports",
  },
  {
    slug: "vip-meet-greet",
    name: "VIP Meet & Greet",
    category: "airport",
    websites: ["airport"],
    description: "VIP airport meet and greet service",
  },
  {
    slug: "flight-tracking",
    name: "Flight Tracking Service",
    category: "airport",
    websites: ["airport"],
    description: "Real-time flight monitoring and pickup",
  },
  {
    slug: "early-morning-airport",
    name: "Early Morning Airport",
    category: "airport",
    websites: ["airport"],
    description: "Early morning flight transportation",
  },
  {
    slug: "late-night-airport",
    name: "Late Night Airport",
    category: "airport",
    websites: ["airport"],
    description: "Late night arrival and departure service",
  },
  {
    slug: "international-terminal",
    name: "International Terminal",
    category: "airport",
    websites: ["airport"],
    description: "International terminal pickup and drop-off",
  },
  {
    slug: "private-jet-transfer",
    name: "Private Jet Transfer",
    category: "airport",
    websites: ["airport"],
    description: "FBO and private aviation transfers",
  },
  {
    slug: "airport-sedan",
    name: "Airport Sedan Service",
    category: "airport",
    websites: ["airport"],
    description: "Luxury sedan airport transportation",
  },
  {
    slug: "airport-suv",
    name: "Airport SUV Service",
    category: "airport",
    websites: ["airport"],
    description: "SUV airport transportation for groups",
  },
  {
    slug: "airport-sprinter",
    name: "Airport Sprinter Van",
    category: "airport",
    websites: ["airport"],
    description: "Sprinter van for larger groups",
  },
  {
    slug: "curbside-pickup",
    name: "Curbside Pickup",
    category: "airport",
    websites: ["airport"],
    description: "Convenient curbside airport pickup",
  },
  {
    slug: "luggage-assistance",
    name: "Luggage Assistance",
    category: "airport",
    websites: ["airport"],
    description: "Full luggage handling service",
  },
  {
    slug: "child-seat-airport",
    name: "Child Seat Service",
    category: "airport",
    websites: ["airport"],
    description: "Airport transfer with child seats",
  },
  {
    slug: "pet-friendly-airport",
    name: "Pet Friendly Airport",
    category: "airport",
    websites: ["airport"],
    description: "Pet-friendly airport transportation",
  },
  {
    slug: "round-trip-airport",
    name: "Round Trip Airport",
    category: "airport",
    websites: ["airport"],
    description: "Round trip airport service with savings",
  },
  {
    slug: "multi-stop-airport",
    name: "Multi-Stop Airport",
    category: "airport",
    websites: ["airport"],
    description: "Multiple pickup/drop-off airport service",
  },

  // Corporate Services (20)
  {
    slug: "executive-car",
    name: "Executive Car Service",
    category: "corporate",
    websites: ["corporate"],
    description: "Premium executive transportation",
  },
  {
    slug: "corporate-black-car",
    name: "Corporate Black Car",
    category: "corporate",
    websites: ["corporate"],
    description: "Professional black car service",
  },
  {
    slug: "hourly-chauffeur",
    name: "Hourly Chauffeur",
    category: "corporate",
    websites: ["corporate"],
    description: "By-the-hour chauffeur service",
  },
  {
    slug: "daily-commute",
    name: "Daily Commute Service",
    category: "corporate",
    websites: ["corporate"],
    description: "Daily commuter transportation",
  },
  {
    slug: "board-member-travel",
    name: "Board Member Travel",
    category: "corporate",
    websites: ["corporate"],
    description: "VIP board member transportation",
  },
  {
    slug: "client-entertainment",
    name: "Client Entertainment",
    category: "corporate",
    websites: ["corporate"],
    description: "Client entertainment transportation",
  },
  {
    slug: "conference-transport",
    name: "Conference Transport",
    category: "corporate",
    websites: ["corporate"],
    description: "Convention and conference service",
  },
  {
    slug: "corporate-event",
    name: "Corporate Event",
    category: "corporate",
    websites: ["corporate"],
    description: "Corporate event transportation",
  },
  {
    slug: "roadshow-service",
    name: "Roadshow Service",
    category: "corporate",
    websites: ["corporate"],
    description: "Multi-day roadshow transportation",
  },
  {
    slug: "office-to-office",
    name: "Office to Office",
    category: "corporate",
    websites: ["corporate"],
    description: "Inter-office transportation",
  },
  {
    slug: "investor-meetings",
    name: "Investor Meetings",
    category: "corporate",
    websites: ["corporate"],
    description: "Investor meeting transportation",
  },
  {
    slug: "team-building",
    name: "Team Building Events",
    category: "corporate",
    websites: ["corporate"],
    description: "Team building event transportation",
  },
  {
    slug: "corporate-retreat",
    name: "Corporate Retreat",
    category: "corporate",
    websites: ["corporate"],
    description: "Corporate retreat transportation",
  },
  {
    slug: "trade-show",
    name: "Trade Show Transport",
    category: "corporate",
    websites: ["corporate"],
    description: "Trade show and expo service",
  },
  {
    slug: "private-dining",
    name: "Private Dining",
    category: "corporate",
    websites: ["corporate"],
    description: "Restaurant and dining transportation",
  },
  {
    slug: "golf-outing",
    name: "Golf Outing",
    category: "corporate",
    websites: ["corporate"],
    description: "Golf course transportation",
  },
  {
    slug: "corporate-anniversary",
    name: "Corporate Anniversary",
    category: "corporate",
    websites: ["corporate"],
    description: "Company anniversary events",
  },
  {
    slug: "employee-shuttle",
    name: "Employee Shuttle",
    category: "corporate",
    websites: ["corporate"],
    description: "Employee shuttle service",
  },
  {
    slug: "executive-protection",
    name: "Executive Protection",
    category: "corporate",
    websites: ["corporate"],
    description: "Secure executive transport",
  },
  {
    slug: "vip-client-service",
    name: "VIP Client Service",
    category: "corporate",
    websites: ["corporate"],
    description: "VIP client transportation",
  },

  // Wedding Services (20)
  {
    slug: "wedding-limo",
    name: "Wedding Limousine",
    category: "wedding",
    websites: ["wedding"],
    description: "Classic wedding limousine service",
  },
  {
    slug: "bride-transportation",
    name: "Bride Transportation",
    category: "wedding",
    websites: ["wedding"],
    description: "Elegant bride transportation",
  },
  {
    slug: "groom-groomsmen",
    name: "Groom & Groomsmen",
    category: "wedding",
    websites: ["wedding"],
    description: "Groom and groomsmen service",
  },
  {
    slug: "bridal-party",
    name: "Bridal Party Transport",
    category: "wedding",
    websites: ["wedding"],
    description: "Full bridal party transportation",
  },
  {
    slug: "wedding-guest-shuttle",
    name: "Wedding Guest Shuttle",
    category: "wedding",
    websites: ["wedding"],
    description: "Guest shuttle service",
  },
  {
    slug: "church-to-reception",
    name: "Church to Reception",
    category: "wedding",
    websites: ["wedding"],
    description: "Ceremony to reception transport",
  },
  {
    slug: "honeymoon-transfer",
    name: "Honeymoon Transfer",
    category: "wedding",
    websites: ["wedding"],
    description: "Airport honeymoon departure",
  },
  {
    slug: "rehearsal-dinner",
    name: "Rehearsal Dinner",
    category: "wedding",
    websites: ["wedding"],
    description: "Rehearsal dinner transportation",
  },
  {
    slug: "wedding-getaway",
    name: "Wedding Getaway Car",
    category: "wedding",
    websites: ["wedding"],
    description: "Grand exit getaway service",
  },
  {
    slug: "photo-tour",
    name: "Photo Tour Service",
    category: "wedding",
    websites: ["wedding"],
    description: "Wedding photo tour transport",
  },
  {
    slug: "out-of-town-guests",
    name: "Out of Town Guests",
    category: "wedding",
    websites: ["wedding"],
    description: "Out-of-town guest service",
  },
  {
    slug: "wedding-coordinator",
    name: "Wedding Coordinator",
    category: "wedding",
    websites: ["wedding"],
    description: "Coordinator transportation",
  },
  {
    slug: "vintage-wedding-car",
    name: "Vintage Wedding Car",
    category: "wedding",
    websites: ["wedding"],
    description: "Classic vintage car service",
  },
  {
    slug: "stretch-limo-wedding",
    name: "Stretch Limo Wedding",
    category: "wedding",
    websites: ["wedding"],
    description: "Stretch limousine for weddings",
  },
  {
    slug: "suv-limo-wedding",
    name: "SUV Limo Wedding",
    category: "wedding",
    websites: ["wedding"],
    description: "SUV limousine for weddings",
  },
  {
    slug: "party-bus-wedding",
    name: "Party Bus Wedding",
    category: "wedding",
    websites: ["wedding"],
    description: "Party bus for wedding parties",
  },
  {
    slug: "sprinter-wedding",
    name: "Sprinter Wedding",
    category: "wedding",
    websites: ["wedding"],
    description: "Luxury Sprinter for weddings",
  },
  {
    slug: "sedan-wedding",
    name: "Sedan Wedding Service",
    category: "wedding",
    websites: ["wedding"],
    description: "Elegant sedan for couples",
  },
  {
    slug: "coach-bus-wedding",
    name: "Coach Bus Wedding",
    category: "wedding",
    websites: ["wedding"],
    description: "Full coach for large weddings",
  },
  {
    slug: "destination-wedding",
    name: "Destination Wedding",
    category: "wedding",
    websites: ["wedding"],
    description: "Destination wedding transport",
  },

  // Party Bus Services (20)
  {
    slug: "bachelor-party-bus",
    name: "Bachelor Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Bachelor party transportation",
  },
  {
    slug: "bachelorette-party-bus",
    name: "Bachelorette Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Bachelorette party service",
  },
  {
    slug: "birthday-party-bus",
    name: "Birthday Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Birthday celebration transport",
  },
  {
    slug: "prom-party-bus",
    name: "Prom Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Prom night transportation",
  },
  {
    slug: "concert-transportation",
    name: "Concert Transportation",
    category: "partybus",
    websites: ["partybus"],
    description: "Concert and show transport",
  },
  {
    slug: "sporting-event-party-bus",
    name: "Sporting Event Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Sports game transportation",
  },
  {
    slug: "brewery-tour-party-bus",
    name: "Brewery Tour Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Brewery and winery tours",
  },
  {
    slug: "nightclub-tour-party-bus",
    name: "Nightclub Tour",
    category: "partybus",
    websites: ["partybus"],
    description: "Nightclub hopping service",
  },
  {
    slug: "casino-trip-party-bus",
    name: "Casino Trip Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Casino trip transportation",
  },
  {
    slug: "graduation-party-bus",
    name: "Graduation Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Graduation celebration",
  },
  {
    slug: "corporate-party-bus",
    name: "Corporate Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Corporate party events",
  },
  {
    slug: "holiday-party-bus",
    name: "Holiday Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Holiday celebration transport",
  },
  {
    slug: "sweet-16-party-bus",
    name: "Sweet 16 Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Sweet 16 birthday parties",
  },
  {
    slug: "quinceañera-party-bus",
    name: "Quinceañera Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Quinceañera celebrations",
  },
  {
    slug: "anniversary-party-bus",
    name: "Anniversary Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Anniversary celebrations",
  },
  {
    slug: "club-crawl-party-bus",
    name: "Club Crawl Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Bar and club crawls",
  },
  {
    slug: "tailgate-party-bus",
    name: "Tailgate Party Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Tailgate party service",
  },
  {
    slug: "custom-chicago-tour",
    name: "Custom Chicago Tour",
    category: "partybus",
    websites: ["partybus"],
    description: "Custom city tour service",
  },
  {
    slug: "food-tour-party-bus",
    name: "Food Tour Bus",
    category: "partybus",
    websites: ["partybus"],
    description: "Chicago food tour service",
  },
  {
    slug: "architecture-tour",
    name: "Architecture Tour",
    category: "partybus",
    websites: ["partybus"],
    description: "Chicago architecture tours",
  },

  // Cross-site Services (11)
  {
    slug: "hourly-service",
    name: "Hourly Service",
    category: "general",
    websites: ["airport", "corporate", "wedding", "partybus"],
    description: "Flexible hourly booking",
  },
  {
    slug: "point-to-point",
    name: "Point to Point",
    category: "general",
    websites: ["airport", "corporate", "wedding", "partybus"],
    description: "Direct A to B service",
  },
  {
    slug: "chauffeur-service",
    name: "Chauffeur Service",
    category: "general",
    websites: ["airport", "corporate", "wedding"],
    description: "Professional chauffeur",
  },
  {
    slug: "luxury-sedan",
    name: "Luxury Sedan",
    category: "general",
    websites: ["airport", "corporate", "wedding"],
    description: "Premium sedan service",
  },
  {
    slug: "luxury-suv",
    name: "Luxury SUV",
    category: "general",
    websites: ["airport", "corporate", "wedding", "partybus"],
    description: "Luxury SUV transport",
  },
  {
    slug: "sprinter-van",
    name: "Sprinter Van",
    category: "general",
    websites: ["airport", "corporate", "wedding", "partybus"],
    description: "Mercedes Sprinter service",
  },
  {
    slug: "stretch-limousine",
    name: "Stretch Limousine",
    category: "general",
    websites: ["wedding", "partybus"],
    description: "Classic stretch limo",
  },
  {
    slug: "coach-bus",
    name: "Coach Bus",
    category: "general",
    websites: ["corporate", "wedding", "partybus"],
    description: "Full-size coach bus",
  },
  {
    slug: "vip-service",
    name: "VIP Service",
    category: "general",
    websites: ["airport", "corporate", "wedding"],
    description: "VIP treatment package",
  },
  {
    slug: "special-occasion",
    name: "Special Occasion",
    category: "general",
    websites: ["corporate", "wedding", "partybus"],
    description: "Special event service",
  },
  {
    slug: "group-transportation",
    name: "Group Transportation",
    category: "general",
    websites: ["airport", "corporate", "wedding", "partybus"],
    description: "Large group service",
  },
];

// ============================================
// FLEET VEHICLES DATA (14 total)
// ============================================
const fleetVehicles = [
  // Luxury Sedans
  {
    id: "lincoln-continental",
    name: "Lincoln Continental",
    category: "sedan",
    capacity: 3,
    luggage: 3,
    amenities: [
      "Leather seats",
      "Climate control",
      "WiFi",
      "Phone charger",
      "Bottled water",
    ],
    description:
      "Classic American luxury sedan perfect for executive travel and airport transfers.",
    pricePerHour: 75,
    pricePerMile: 3.5,
    images: ["/images/fleet/lincoln-continental.jpg"],
    websites: ["airport", "corporate", "wedding"],
  },
  {
    id: "cadillac-xts",
    name: "Cadillac XTS",
    category: "sedan",
    capacity: 3,
    luggage: 3,
    amenities: [
      "Leather seats",
      "Climate control",
      "WiFi",
      "USB ports",
      "Bottled water",
    ],
    description:
      "Sophisticated Cadillac sedan offering comfort and style for business travel.",
    pricePerHour: 80,
    pricePerMile: 3.75,
    images: ["/images/fleet/cadillac-xts.jpg"],
    websites: ["airport", "corporate", "wedding"],
  },
  {
    id: "mercedes-s-class",
    name: "Mercedes-Benz S-Class",
    category: "sedan",
    capacity: 3,
    luggage: 3,
    amenities: [
      "Premium leather",
      "Massage seats",
      "Climate control",
      "WiFi",
      "Champagne service",
    ],
    description:
      "The pinnacle of luxury sedans for the most discerning clients.",
    pricePerHour: 125,
    pricePerMile: 5.0,
    images: ["/images/fleet/mercedes-s-class.jpg"],
    websites: ["airport", "corporate", "wedding"],
  },
  {
    id: "bmw-7-series",
    name: "BMW 7 Series",
    category: "sedan",
    capacity: 3,
    luggage: 3,
    amenities: [
      "Leather seats",
      "Executive lounge seating",
      "WiFi",
      "Entertainment system",
    ],
    description: "German engineering excellence for executive transportation.",
    pricePerHour: 120,
    pricePerMile: 4.75,
    images: ["/images/fleet/bmw-7-series.jpg"],
    websites: ["airport", "corporate", "wedding"],
  },

  // Luxury SUVs
  {
    id: "cadillac-escalade",
    name: "Cadillac Escalade",
    category: "suv",
    capacity: 6,
    luggage: 6,
    amenities: [
      "Leather seats",
      "Third row",
      "WiFi",
      "Climate control",
      "USB ports",
    ],
    description: "Premium full-size SUV ideal for groups and families.",
    pricePerHour: 95,
    pricePerMile: 4.25,
    images: ["/images/fleet/cadillac-escalade.jpg"],
    websites: ["airport", "corporate", "wedding", "partybus"],
  },
  {
    id: "lincoln-navigator",
    name: "Lincoln Navigator",
    category: "suv",
    capacity: 6,
    luggage: 6,
    amenities: [
      "Leather seats",
      "Third row",
      "WiFi",
      "Panoramic roof",
      "Climate control",
    ],
    description:
      "Spacious luxury SUV with exceptional comfort for group travel.",
    pricePerHour: 95,
    pricePerMile: 4.25,
    images: ["/images/fleet/lincoln-navigator.jpg"],
    websites: ["airport", "corporate", "wedding", "partybus"],
  },
  {
    id: "chevrolet-suburban",
    name: "Chevrolet Suburban",
    category: "suv",
    capacity: 7,
    luggage: 7,
    amenities: ["Leather seats", "Third row", "WiFi", "Entertainment system"],
    description: "Full-size SUV perfect for large groups with luggage.",
    pricePerHour: 85,
    pricePerMile: 4.0,
    images: ["/images/fleet/chevrolet-suburban.jpg"],
    websites: ["airport", "corporate", "wedding", "partybus"],
  },
  {
    id: "gmc-yukon-denali",
    name: "GMC Yukon Denali",
    category: "suv",
    capacity: 6,
    luggage: 6,
    amenities: ["Premium leather", "Climate control", "WiFi", "Bose audio"],
    description: "Premium SUV with refined luxury appointments.",
    pricePerHour: 90,
    pricePerMile: 4.0,
    images: ["/images/fleet/gmc-yukon-denali.jpg"],
    websites: ["airport", "corporate", "wedding", "partybus"],
  },

  // Stretch Limousines
  {
    id: "lincoln-stretch-limo",
    name: "Lincoln Stretch Limousine",
    category: "stretch",
    capacity: 10,
    luggage: 4,
    amenities: [
      "Bar",
      "Fiber optic lighting",
      "Premium sound",
      "Privacy partition",
      "Champagne",
    ],
    description:
      "Classic stretch limousine for weddings and special occasions.",
    pricePerHour: 150,
    pricePerMile: 6.0,
    images: ["/images/fleet/lincoln-stretch.jpg"],
    websites: ["wedding", "partybus"],
  },

  // Executive Vans
  {
    id: "mercedes-sprinter-executive",
    name: "Mercedes Sprinter Executive",
    category: "van",
    capacity: 14,
    luggage: 14,
    amenities: [
      "Leather captain chairs",
      "WiFi",
      "USB ports",
      "Climate control",
      "Wood trim",
    ],
    description: "Executive Sprinter van for corporate groups and events.",
    pricePerHour: 125,
    pricePerMile: 5.0,
    images: ["/images/fleet/mercedes-sprinter.jpg"],
    websites: ["airport", "corporate", "wedding", "partybus"],
  },
  {
    id: "mercedes-sprinter-luxury",
    name: "Mercedes Sprinter Luxury",
    category: "van",
    capacity: 12,
    luggage: 12,
    amenities: [
      "Luxury leather",
      "Bar",
      "Entertainment system",
      "WiFi",
      "LED lighting",
    ],
    description: "Luxury Sprinter with premium amenities for VIP transport.",
    pricePerHour: 150,
    pricePerMile: 5.5,
    images: ["/images/fleet/mercedes-sprinter-luxury.jpg"],
    websites: ["corporate", "wedding", "partybus"],
  },

  // Party Buses
  {
    id: "party-bus-full",
    name: "Full-Size Party Bus",
    category: "partybus",
    capacity: 36,
    luggage: 0,
    amenities: [
      "Dance pole",
      "Laser lights",
      "Premium sound",
      "Bar",
      "Restroom",
      "TVs",
    ],
    description:
      "Ultimate party bus for bachelor/bachelorette parties and celebrations.",
    pricePerHour: 275,
    pricePerMile: 8.0,
    images: ["/images/fleet/party-bus-full.jpg"],
    websites: ["partybus", "wedding"],
  },
  {
    id: "party-bus-mid",
    name: "Mid-Size Party Bus",
    category: "partybus",
    capacity: 24,
    luggage: 0,
    amenities: [
      "LED lighting",
      "Premium sound",
      "Bar area",
      "TVs",
      "Climate control",
    ],
    description: "Perfect party bus for medium-sized groups and celebrations.",
    pricePerHour: 225,
    pricePerMile: 7.0,
    images: ["/images/fleet/party-bus-mid.jpg"],
    websites: ["partybus", "wedding"],
  },

  // Coach Buses
  {
    id: "motor-coach",
    name: "Full-Size Motor Coach",
    category: "coach",
    capacity: 56,
    luggage: 56,
    amenities: [
      "Reclining seats",
      "Restroom",
      "WiFi",
      "Entertainment system",
      "Overhead storage",
    ],
    description:
      "Full-size coach bus for large groups, weddings, and corporate events.",
    pricePerHour: 200,
    pricePerMile: 6.5,
    images: ["/images/fleet/motor-coach.jpg"],
    websites: ["corporate", "wedding", "partybus"],
  },
];

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

async function initializeLocations() {
  console.log("Initializing locations...");
  const batch = db.batch();
  let count = 0;

  for (const location of allLocations) {
    const ref = db.collection("locations").doc(location.slug);
    batch.set(
      ref,
      {
        ...location,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    count++;

    // Firestore batch limit is 500
    if (count % 400 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} locations...`);
    }
  }

  await batch.commit();
  console.log(`✓ Initialized ${count} locations`);
  return count;
}

async function initializeServices() {
  console.log("Initializing services...");
  const batch = db.batch();
  let count = 0;

  for (const service of services) {
    const ref = db.collection("services").doc(service.slug);
    batch.set(
      ref,
      {
        ...service,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    count++;
  }

  await batch.commit();
  console.log(`✓ Initialized ${count} services`);
  return count;
}

async function initializeFleetVehicles() {
  console.log("Initializing fleet vehicles...");
  const batch = db.batch();
  let count = 0;

  for (const vehicle of fleetVehicles) {
    const ref = db.collection("fleet_vehicles").doc(vehicle.id);
    batch.set(
      ref,
      {
        ...vehicle,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    count++;
  }

  await batch.commit();
  console.log(`✓ Initialized ${count} fleet vehicles`);
  return count;
}

async function main() {
  console.log("==========================================");
  console.log("ROYAL CARRIAGE FIRESTORE INITIALIZATION");
  console.log("==========================================\n");

  try {
    const locationsCount = await initializeLocations();
    const servicesCount = await initializeServices();
    const fleetCount = await initializeFleetVehicles();

    console.log("\n==========================================");
    console.log("INITIALIZATION COMPLETE");
    console.log("==========================================");
    console.log(`Locations: ${locationsCount}`);
    console.log(`Services: ${servicesCount}`);
    console.log(`Fleet Vehicles: ${fleetCount}`);
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
}

main();
