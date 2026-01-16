export interface City {
  name: string;
  slug: string;
  region:
    | "North Shore"
    | "West Suburbs"
    | "South Suburbs"
    | "Northwest Suburbs"
    | "Southwest Suburbs"
    | "Far West Suburbs";
  distanceToOhare: string;
  distanceToMidway: string;
  neighborhoods: string[];
  metaDescription: string;
}

export const cities: City[] = [
  // North Shore Suburbs
  {
    name: "Evanston",
    slug: "evanston",
    region: "North Shore",
    distanceToOhare: "18 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "Downtown Evanston",
      "Central Street",
      "South Evanston",
      "Northwest Evanston",
      "Rogers Park Border",
    ],
    metaDescription:
      "Premium airport car service in Evanston, IL. Professional chauffeurs providing luxury transportation to O'Hare and Midway airports. Flat-rate pricing, flight tracking included.",
  },
  {
    name: "Skokie",
    slug: "skokie",
    region: "North Shore",
    distanceToOhare: "16 miles",
    distanceToMidway: "20 miles",
    neighborhoods: [
      "Downtown Skokie",
      "Old Orchard",
      "Westfield Old Orchard",
      "Skokie Valley",
      "East Skokie",
    ],
    metaDescription:
      "Reliable airport transportation from Skokie to O'Hare and Midway. Black car service with professional drivers, flat rates, and complimentary flight tracking.",
  },
  {
    name: "Wilmette",
    slug: "wilmette",
    region: "North Shore",
    distanceToOhare: "19 miles",
    distanceToMidway: "24 miles",
    neighborhoods: [
      "Wilmette Village Center",
      "West Wilmette",
      "East Wilmette",
      "Kenilworth Gardens",
      "Indian Hill",
    ],
    metaDescription:
      "Executive airport car service from Wilmette to Chicago airports. Luxury sedans and SUVs with experienced chauffeurs. Book your O'Hare or Midway transfer today.",
  },
  {
    name: "Glenview",
    slug: "glenview",
    region: "North Shore",
    distanceToOhare: "14 miles",
    distanceToMidway: "25 miles",
    neighborhoods: [
      "Downtown Glenview",
      "The Glen",
      "Glenview Naval Air Station",
      "North Glenview",
      "Johns Creek",
    ],
    metaDescription:
      "Airport black car service in Glenview, IL. Door-to-door transportation to O'Hare and Midway with professional chauffeurs. Flat-rate pricing available.",
  },
  {
    name: "Northbrook",
    slug: "northbrook",
    region: "North Shore",
    distanceToOhare: "12 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Downtown Northbrook",
      "Northbrook Court",
      "West Northbrook",
      "Techny",
      "Shermer",
    ],
    metaDescription:
      "Premium airport transportation from Northbrook to O'Hare and Midway. Luxury vehicles, professional service, and competitive flat-rate pricing.",
  },
  {
    name: "Highland Park",
    slug: "highland-park",
    region: "North Shore",
    distanceToOhare: "22 miles",
    distanceToMidway: "32 miles",
    neighborhoods: [
      "Downtown Highland Park",
      "Ravinia",
      "Port Clinton",
      "Braeside",
      "Highwood Border",
    ],
    metaDescription:
      "Luxury airport car service from Highland Park to Chicago airports. Professional chauffeurs, premium vehicles, and reliable flat-rate transportation.",
  },
  {
    name: "Lake Forest",
    slug: "lake-forest",
    region: "North Shore",
    distanceToOhare: "26 miles",
    distanceToMidway: "36 miles",
    neighborhoods: [
      "Market Square",
      "West Lake Forest",
      "East Lake Forest",
      "Skokie Valley",
      "Lake Bluff Border",
    ],
    metaDescription:
      "Executive airport transportation from Lake Forest, IL. Premium black car service to O'Hare and Midway with experienced professional chauffeurs.",
  },
  {
    name: "Winnetka",
    slug: "winnetka",
    region: "North Shore",
    distanceToOhare: "20 miles",
    distanceToMidway: "26 miles",
    neighborhoods: [
      "Downtown Winnetka",
      "Indian Hill",
      "Hubbard Woods",
      "West Winnetka",
      "Crow Island",
    ],
    metaDescription:
      "Premium airport car service in Winnetka. Luxury transportation to O'Hare and Midway airports with professional chauffeurs and flat-rate pricing.",
  },
  {
    name: "Deerfield",
    slug: "deerfield",
    region: "North Shore",
    distanceToOhare: "18 miles",
    distanceToMidway: "30 miles",
    neighborhoods: [
      "Downtown Deerfield",
      "Briarwood",
      "Deerfield Park Plaza",
      "West Deerfield",
      "Riverwoods Border",
    ],
    metaDescription:
      "Reliable airport transportation from Deerfield to O'Hare and Midway. Black car service with flight tracking and flat-rate suburban pricing.",
  },
  {
    name: "Glencoe",
    slug: "glencoe",
    region: "North Shore",
    distanceToOhare: "21 miles",
    distanceToMidway: "27 miles",
    neighborhoods: [
      "Downtown Glencoe",
      "West Glencoe",
      "Hubbard Woods Border",
      "Chicago Botanic Garden Area",
    ],
    metaDescription:
      "Executive airport car service from Glencoe to Chicago airports. Professional chauffeurs, luxury vehicles, and competitive rates.",
  },
  {
    name: "Libertyville",
    slug: "libertyville",
    region: "North Shore",
    distanceToOhare: "24 miles",
    distanceToMidway: "38 miles",
    neighborhoods: [
      "Downtown Libertyville",
      "Adler Park",
      "Butler Lake",
      "West Libertyville",
      "Green Oaks Border",
    ],
    metaDescription:
      "Airport black car service from Libertyville, IL. Door-to-door transportation to O'Hare and Midway with professional drivers and flat rates.",
  },
  {
    name: "Vernon Hills",
    slug: "vernon-hills",
    region: "North Shore",
    distanceToOhare: "22 miles",
    distanceToMidway: "36 miles",
    neighborhoods: [
      "Hawthorn Mall",
      "Downtown Vernon Hills",
      "Gregg's Landing",
      "Lakeshore",
      "Deerpath",
    ],
    metaDescription:
      "Premium airport transportation from Vernon Hills to Chicago airports. Luxury sedans and SUVs with experienced chauffeurs available 24/7.",
  },
  {
    name: "Buffalo Grove",
    slug: "buffalo-grove",
    region: "North Shore",
    distanceToOhare: "15 miles",
    distanceToMidway: "32 miles",
    neighborhoods: [
      "Downtown Buffalo Grove",
      "Strathmore",
      "Prairie View",
      "Cambridge on the Lake",
      "Checker Drive",
    ],
    metaDescription:
      "Reliable airport car service from Buffalo Grove to O'Hare and Midway. Professional black car transportation with flat-rate pricing.",
  },
  {
    name: "Lincolnshire",
    slug: "lincolnshire",
    region: "North Shore",
    distanceToOhare: "20 miles",
    distanceToMidway: "34 miles",
    neighborhoods: [
      "Lincolnshire Corporate Center",
      "Marriott Theatre Area",
      "North Lincolnshire",
      "Riverwoods Border",
    ],
    metaDescription:
      "Executive airport transportation from Lincolnshire, IL. Premium black car service to O'Hare and Midway with professional chauffeurs.",
  },
  {
    name: "Kenilworth",
    slug: "kenilworth",
    region: "North Shore",
    distanceToOhare: "20 miles",
    distanceToMidway: "25 miles",
    neighborhoods: [
      "Kenilworth Beach",
      "Village Center",
      "Wilmette Border",
      "Winnetka Border",
    ],
    metaDescription:
      "Exclusive airport car service from Kenilworth, IL. Premium black car transportation to O'Hare and Midway with professional chauffeurs.",
  },
  {
    name: "Lake Bluff",
    slug: "lake-bluff",
    region: "North Shore",
    distanceToOhare: "28 miles",
    distanceToMidway: "38 miles",
    neighborhoods: [
      "Downtown Lake Bluff",
      "Lake Forest Border",
      "Great Lakes Naval Base Area",
      "Sunrise Beach",
    ],
    metaDescription:
      "Premium airport transportation from Lake Bluff to Chicago airports. Luxury black car service with experienced professional chauffeurs.",
  },
  {
    name: "Bannockburn",
    slug: "bannockburn",
    region: "North Shore",
    distanceToOhare: "24 miles",
    distanceToMidway: "34 miles",
    neighborhoods: [
      "Half Day Road Corridor",
      "Deerfield Border",
      "Lake Forest Border",
    ],
    metaDescription:
      "Executive airport car service from Bannockburn, IL. Premium transportation to O'Hare and Midway with professional chauffeurs.",
  },
  {
    name: "Riverwoods",
    slug: "riverwoods",
    region: "North Shore",
    distanceToOhare: "18 miles",
    distanceToMidway: "32 miles",
    neighborhoods: [
      "Des Plaines River Area",
      "Deerfield Border",
      "Lincolnshire Border",
      "Northbrook Border",
    ],
    metaDescription:
      "Reliable airport transportation from Riverwoods to O'Hare and Midway. Black car service with professional drivers and flat rates.",
  },

  // West Suburbs
  {
    name: "Naperville",
    slug: "naperville",
    region: "West Suburbs",
    distanceToOhare: "32 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Downtown Naperville",
      "North Naperville",
      "South Naperville",
      "Winding Creek",
      "White Eagle",
      "Ashbury",
    ],
    metaDescription:
      "Premium airport car service in Naperville, IL. Professional chauffeurs providing luxury transportation to O'Hare and Midway. Flat-rate pricing, 24/7 availability.",
  },
  {
    name: "Oak Brook",
    slug: "oak-brook",
    region: "West Suburbs",
    distanceToOhare: "20 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Oak Brook Center",
      "Oak Brook Hills",
      "Butler National",
      "The Drury Lane Area",
      "Commerce District",
    ],
    metaDescription:
      "Executive airport transportation from Oak Brook to Chicago airports. Luxury black car service with professional drivers and competitive rates.",
  },
  {
    name: "Downers Grove",
    slug: "downers-grove",
    region: "West Suburbs",
    distanceToOhare: "24 miles",
    distanceToMidway: "20 miles",
    neighborhoods: [
      "Downtown Downers Grove",
      "Good Samaritan Area",
      "Fairview",
      "Belmont",
      "Prince Pond",
    ],
    metaDescription:
      "Reliable airport car service from Downers Grove to O'Hare and Midway. Professional black car transportation with flat rates.",
  },
  {
    name: "Elmhurst",
    slug: "elmhurst",
    region: "West Suburbs",
    distanceToOhare: "16 miles",
    distanceToMidway: "16 miles",
    neighborhoods: [
      "Downtown Elmhurst",
      "Elmhurst College Area",
      "Salt Creek",
      "Spring Road",
      "York Road Corridor",
    ],
    metaDescription:
      "Executive airport transportation from Elmhurst, IL. Centrally located between O'Hare and Midway with professional chauffeur service.",
  },
  {
    name: "Wheaton",
    slug: "wheaton",
    region: "West Suburbs",
    distanceToOhare: "26 miles",
    distanceToMidway: "24 miles",
    neighborhoods: [
      "Downtown Wheaton",
      "Wheaton College Area",
      "Arrowhead",
      "Danada",
      "Country Knolls",
    ],
    metaDescription:
      "Premium airport car service from Wheaton to Chicago airports. Luxury vehicles with professional drivers and competitive flat-rate pricing.",
  },
  {
    name: "Glen Ellyn",
    slug: "glen-ellyn",
    region: "West Suburbs",
    distanceToOhare: "24 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "Downtown Glen Ellyn",
      "College of DuPage Area",
      "Churchill",
      "Forest Glen",
      "Stacy's Corners",
    ],
    metaDescription:
      "Reliable airport transportation from Glen Ellyn to O'Hare and Midway. Black car service with professional chauffeurs and flat rates.",
  },
  {
    name: "Lombard",
    slug: "lombard",
    region: "West Suburbs",
    distanceToOhare: "20 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Downtown Lombard",
      "Lilacia Park",
      "Four Seasons",
      "Yorktown Center Area",
      "Butterfield",
    ],
    metaDescription:
      "Airport black car service from Lombard, IL. Door-to-door transportation to O'Hare and Midway with professional drivers.",
  },
  {
    name: "Hinsdale",
    slug: "hinsdale",
    region: "West Suburbs",
    distanceToOhare: "22 miles",
    distanceToMidway: "16 miles",
    neighborhoods: [
      "Downtown Hinsdale",
      "Oak Brook Border",
      "Clarendon Hills Border",
      "Southeast Hinsdale",
      "Fullersburg Woods Area",
    ],
    metaDescription:
      "Executive airport car service from Hinsdale. Premium transportation to O'Hare and Midway with luxury vehicles and professional chauffeurs.",
  },
  {
    name: "Clarendon Hills",
    slug: "clarendon-hills",
    region: "West Suburbs",
    distanceToOhare: "24 miles",
    distanceToMidway: "17 miles",
    neighborhoods: [
      "Downtown Clarendon Hills",
      "Prospect Park",
      "Holmes School Area",
      "Westmont Border",
    ],
    metaDescription:
      "Premium airport transportation from Clarendon Hills to Chicago airports. Professional black car service with competitive rates.",
  },
  {
    name: "Westmont",
    slug: "westmont",
    region: "West Suburbs",
    distanceToOhare: "22 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Oakbrook Center Area",
      "Downtown Westmont",
      "Ty Warner Park",
      "Ogden Avenue Corridor",
    ],
    metaDescription:
      "Reliable airport car service from Westmont to O'Hare and Midway. Professional chauffeurs and flat-rate suburban pricing.",
  },
  {
    name: "Lisle",
    slug: "lisle",
    region: "West Suburbs",
    distanceToOhare: "26 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "Downtown Lisle",
      "Morton Arboretum Area",
      "Corporate Corridor",
      "Green Trails",
      "Benedictine University Area",
    ],
    metaDescription:
      "Airport transportation from Lisle, IL to O'Hare and Midway. Black car service with professional drivers and competitive rates.",
  },
  {
    name: "Woodridge",
    slug: "woodridge",
    region: "West Suburbs",
    distanceToOhare: "28 miles",
    distanceToMidway: "20 miles",
    neighborhoods: [
      "Seven Bridges",
      "Janes Avenue",
      "Woodridge Park District",
      "Hobson Corner",
      "IKEA Area",
    ],
    metaDescription:
      "Premium airport car service from Woodridge to Chicago airports. Door-to-door luxury transportation with professional chauffeurs.",
  },
  {
    name: "Burr Ridge",
    slug: "burr-ridge",
    region: "West Suburbs",
    distanceToOhare: "24 miles",
    distanceToMidway: "15 miles",
    neighborhoods: [
      "Burr Ridge Village Center",
      "County Line Road",
      "Harvester",
      "Oak Ridge",
      "Carriage Way",
    ],
    metaDescription:
      "Executive airport transportation from Burr Ridge to O'Hare and Midway. Luxury black car service with professional chauffeurs.",
  },
  {
    name: "Oak Park",
    slug: "oak-park",
    region: "West Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "12 miles",
    neighborhoods: [
      "Downtown Oak Park",
      "Frank Lloyd Wright District",
      "Hemingway District",
      "Austin Gardens",
      "Ridgeland",
    ],
    metaDescription:
      "Airport black car service from Oak Park to O'Hare and Midway. Close to both airports with professional chauffeur transportation.",
  },
  {
    name: "River Forest",
    slug: "river-forest",
    region: "West Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "13 miles",
    neighborhoods: [
      "Downtown River Forest",
      "Dominican University Area",
      "Thatcher Woods",
      "Concordia Area",
    ],
    metaDescription:
      "Premium airport transportation from River Forest to Chicago airports. Professional black car service with flat-rate pricing.",
  },
  {
    name: "Villa Park",
    slug: "villa-park",
    region: "West Suburbs",
    distanceToOhare: "18 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Downtown Villa Park",
      "Ardmore Avenue",
      "North Avenue Corridor",
      "Elmhurst Border",
    ],
    metaDescription:
      "Reliable airport car service from Villa Park to O'Hare and Midway. Professional chauffeurs with flat-rate suburban pricing.",
  },
  {
    name: "Addison",
    slug: "addison",
    region: "West Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "Downtown Addison",
      "Lake Street Corridor",
      "Army Trail Road",
      "Elmhurst Border",
      "Wood Dale Border",
    ],
    metaDescription:
      "Airport transportation from Addison, IL to O'Hare and Midway. Professional black car service with competitive flat-rate pricing.",
  },
  {
    name: "Bensenville",
    slug: "bensenville",
    region: "West Suburbs",
    distanceToOhare: "6 miles",
    distanceToMidway: "20 miles",
    neighborhoods: [
      "Downtown Bensenville",
      "Irving Park Corridor",
      "O'Hare Area",
      "Elmhurst Border",
    ],
    metaDescription:
      "Premium airport car service from Bensenville. Just 6 miles from O'Hare with professional chauffeurs and luxury vehicles.",
  },
  {
    name: "Wood Dale",
    slug: "wood-dale",
    region: "West Suburbs",
    distanceToOhare: "8 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "Downtown Wood Dale",
      "Irving Park Road",
      "Thorndale Corridor",
      "Addison Border",
    ],
    metaDescription:
      "Airport black car service from Wood Dale. Just 8 miles from O'Hare with professional chauffeur transportation.",
  },
  {
    name: "Westchester",
    slug: "westchester",
    region: "West Suburbs",
    distanceToOhare: "15 miles",
    distanceToMidway: "14 miles",
    neighborhoods: [
      "Downtown Westchester",
      "Mannheim Road Corridor",
      "Oak Brook Border",
      "Hillside Border",
    ],
    metaDescription:
      "Executive airport transportation from Westchester to O'Hare and Midway. Close proximity to both airports with professional service.",
  },
  {
    name: "La Grange",
    slug: "la-grange",
    region: "West Suburbs",
    distanceToOhare: "20 miles",
    distanceToMidway: "12 miles",
    neighborhoods: [
      "Downtown La Grange",
      "La Grange Road Corridor",
      "Brookfield Border",
      "Western Springs Border",
    ],
    metaDescription:
      "Premium airport car service from La Grange to Chicago airports. Professional black car transportation with flat-rate pricing.",
  },
  {
    name: "Western Springs",
    slug: "western-springs",
    region: "West Suburbs",
    distanceToOhare: "20 miles",
    distanceToMidway: "14 miles",
    neighborhoods: [
      "Downtown Western Springs",
      "Tower Area",
      "La Grange Border",
      "Hinsdale Border",
    ],
    metaDescription:
      "Reliable airport transportation from Western Springs to O'Hare and Midway. Professional chauffeurs with competitive rates.",
  },
  {
    name: "Brookfield",
    slug: "brookfield",
    region: "West Suburbs",
    distanceToOhare: "18 miles",
    distanceToMidway: "12 miles",
    neighborhoods: [
      "Downtown Brookfield",
      "Brookfield Zoo Area",
      "Congress Park",
      "La Grange Border",
    ],
    metaDescription:
      "Airport car service from Brookfield to O'Hare and Midway. Professional black car transportation with flat-rate suburban pricing.",
  },
  {
    name: "Riverside",
    slug: "riverside",
    region: "West Suburbs",
    distanceToOhare: "16 miles",
    distanceToMidway: "12 miles",
    neighborhoods: [
      "Downtown Riverside",
      "Historic District",
      "Des Plaines River Area",
      "Brookfield Border",
    ],
    metaDescription:
      "Premium airport transportation from Riverside, IL. Professional black car service to O'Hare and Midway with experienced chauffeurs.",
  },
  {
    name: "Darien",
    slug: "darien",
    region: "West Suburbs",
    distanceToOhare: "26 miles",
    distanceToMidway: "16 miles",
    neighborhoods: [
      "Downtown Darien",
      "Cass Avenue Corridor",
      "Clarendon Hills Border",
      "Willowbrook Border",
    ],
    metaDescription:
      "Executive airport car service from Darien to Chicago airports. Luxury vehicles with professional chauffeurs and flat rates.",
  },
  {
    name: "Willowbrook",
    slug: "willowbrook",
    region: "West Suburbs",
    distanceToOhare: "24 miles",
    distanceToMidway: "16 miles",
    neighborhoods: [
      "Route 83 Corridor",
      "Burr Ridge Border",
      "Darien Border",
      "Clarendon Hills Border",
    ],
    metaDescription:
      "Reliable airport transportation from Willowbrook to O'Hare and Midway. Professional black car service with competitive rates.",
  },

  // Northwest Suburbs
  {
    name: "Schaumburg",
    slug: "schaumburg",
    region: "Northwest Suburbs",
    distanceToOhare: "10 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Woodfield",
      "Town Square",
      "Olde Schaumburg",
      "East Schaumburg",
      "Motorola Campus Area",
    ],
    metaDescription:
      "Airport black car service from Schaumburg to O'Hare and Midway. Just 10 miles from O'Hare with professional chauffeurs and flat-rate pricing.",
  },
  {
    name: "Arlington Heights",
    slug: "arlington-heights",
    region: "Northwest Suburbs",
    distanceToOhare: "8 miles",
    distanceToMidway: "26 miles",
    neighborhoods: [
      "Downtown Arlington Heights",
      "Arlington Park",
      "Rand Road Corridor",
      "Mount Prospect Border",
      "Buffalo Grove Border",
    ],
    metaDescription:
      "Premium airport transportation from Arlington Heights. Just 8 miles from O'Hare with luxury vehicles and professional chauffeur service.",
  },
  {
    name: "Palatine",
    slug: "palatine",
    region: "Northwest Suburbs",
    distanceToOhare: "9 miles",
    distanceToMidway: "30 miles",
    neighborhoods: [
      "Downtown Palatine",
      "Deer Grove",
      "Plum Grove",
      "Inverness Border",
      "Rolling Meadows Border",
    ],
    metaDescription:
      "Airport car service from Palatine. Just 9 miles from O'Hare with luxury vehicles and professional chauffeur service.",
  },
  {
    name: "Hoffman Estates",
    slug: "hoffman-estates",
    region: "Northwest Suburbs",
    distanceToOhare: "12 miles",
    distanceToMidway: "32 miles",
    neighborhoods: [
      "Sears Centre Area",
      "Golf Road Corridor",
      "Poplar Creek",
      "Barrington Road",
      "Higgins Road",
    ],
    metaDescription:
      "Reliable airport transportation from Hoffman Estates to O'Hare and Midway. Professional black car service with competitive rates.",
  },
  {
    name: "Mount Prospect",
    slug: "mount-prospect",
    region: "Northwest Suburbs",
    distanceToOhare: "6 miles",
    distanceToMidway: "24 miles",
    neighborhoods: [
      "Downtown Mount Prospect",
      "Randhurst Village",
      "Kensington Area",
      "Arlington Heights Border",
    ],
    metaDescription:
      "Premium airport car service from Mount Prospect. Just 6 miles from O'Hare with professional chauffeurs and flat-rate pricing.",
  },
  {
    name: "Des Plaines",
    slug: "des-plaines",
    region: "Northwest Suburbs",
    distanceToOhare: "4 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "Downtown Des Plaines",
      "Rivers Casino Area",
      "Mannheim Corridor",
      "O'Hare Area",
      "Park Ridge Border",
    ],
    metaDescription:
      "Airport black car service from Des Plaines. Just 4 miles from O'Hare with professional chauffeurs and competitive rates.",
  },
  {
    name: "Park Ridge",
    slug: "park-ridge",
    region: "Northwest Suburbs",
    distanceToOhare: "8 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Downtown Park Ridge",
      "Uptown",
      "South Park",
      "Edison Park Border",
      "Des Plaines Border",
    ],
    metaDescription:
      "Premium airport transportation from Park Ridge to O'Hare and Midway. Close to both airports with professional chauffeur service.",
  },
  {
    name: "Niles",
    slug: "niles",
    region: "Northwest Suburbs",
    distanceToOhare: "10 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Golf Mill Shopping Center",
      "Downtown Niles",
      "Milwaukee Avenue Corridor",
      "Park Ridge Border",
    ],
    metaDescription:
      "Reliable airport car service from Niles to O'Hare and Midway. Professional black car transportation with flat-rate pricing.",
  },
  {
    name: "Morton Grove",
    slug: "morton-grove",
    region: "Northwest Suburbs",
    distanceToOhare: "12 miles",
    distanceToMidway: "20 miles",
    neighborhoods: [
      "Downtown Morton Grove",
      "Dempster Street Corridor",
      "Sawmill Station",
      "Niles Border",
      "Skokie Border",
    ],
    metaDescription:
      "Airport transportation from Morton Grove to O'Hare and Midway. Professional black car service with experienced chauffeurs.",
  },
  {
    name: "Elk Grove Village",
    slug: "elk-grove-village",
    region: "Northwest Suburbs",
    distanceToOhare: "6 miles",
    distanceToMidway: "26 miles",
    neighborhoods: [
      "Downtown Elk Grove Village",
      "Busse Woods Area",
      "Industrial District",
      "Arlington Heights Border",
    ],
    metaDescription:
      "Premium airport car service from Elk Grove Village. Just 6 miles from O'Hare with professional chauffeurs and flat rates.",
  },
  {
    name: "Rolling Meadows",
    slug: "rolling-meadows",
    region: "Northwest Suburbs",
    distanceToOhare: "10 miles",
    distanceToMidway: "30 miles",
    neighborhoods: [
      "Downtown Rolling Meadows",
      "Kirchoff Road Corridor",
      "Algonquin Road",
      "Arlington Heights Border",
    ],
    metaDescription:
      "Reliable airport transportation from Rolling Meadows to O'Hare. Professional black car service with competitive flat-rate pricing.",
  },
  {
    name: "Prospect Heights",
    slug: "prospect-heights",
    region: "Northwest Suburbs",
    distanceToOhare: "8 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Downtown Prospect Heights",
      "Camp McDonald Road",
      "Wheeling Border",
      "Mount Prospect Border",
    ],
    metaDescription:
      "Airport car service from Prospect Heights to O'Hare and Midway. Professional chauffeurs with flat-rate suburban pricing.",
  },
  {
    name: "Wheeling",
    slug: "wheeling",
    region: "Northwest Suburbs",
    distanceToOhare: "10 miles",
    distanceToMidway: "30 miles",
    neighborhoods: [
      "Downtown Wheeling",
      "Milwaukee Avenue Corridor",
      "Restaurant Row",
      "Prospect Heights Border",
    ],
    metaDescription:
      "Premium airport transportation from Wheeling to Chicago airports. Professional black car service with experienced chauffeurs.",
  },
  {
    name: "Barrington",
    slug: "barrington",
    region: "Northwest Suburbs",
    distanceToOhare: "16 miles",
    distanceToMidway: "38 miles",
    neighborhoods: [
      "Downtown Barrington",
      "Lake Zurich Border",
      "Inverness Border",
      "South Barrington Border",
    ],
    metaDescription:
      "Executive airport car service from Barrington, IL. Luxury vehicles with professional chauffeurs to O'Hare and Midway.",
  },
  {
    name: "South Barrington",
    slug: "south-barrington",
    region: "Northwest Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "36 miles",
    neighborhoods: [
      "Arboretum of South Barrington",
      "Barrington Road Corridor",
      "Hoffman Estates Border",
    ],
    metaDescription:
      "Luxury airport transportation from South Barrington to Chicago airports. Premium black car service with professional chauffeurs.",
  },
  {
    name: "Inverness",
    slug: "inverness",
    region: "Northwest Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "34 miles",
    neighborhoods: [
      "Inverness Golf Club",
      "Palatine Road",
      "Barrington Border",
      "Palatine Border",
    ],
    metaDescription:
      "Executive airport car service from Inverness, IL. Premium transportation to O'Hare and Midway with professional chauffeurs.",
  },

  // South Suburbs
  {
    name: "Orland Park",
    slug: "orland-park",
    region: "South Suburbs",
    distanceToOhare: "32 miles",
    distanceToMidway: "14 miles",
    neighborhoods: [
      "Orland Square",
      "Downtown Orland Park",
      "Old Orland",
      "Orland Hills Border",
      "Homer Glen Border",
    ],
    metaDescription:
      "Airport black car service from Orland Park to O'Hare and Midway. Just 14 miles from Midway with professional chauffeurs.",
  },
  {
    name: "Oak Lawn",
    slug: "oak-lawn",
    region: "South Suburbs",
    distanceToOhare: "24 miles",
    distanceToMidway: "8 miles",
    neighborhoods: [
      "Downtown Oak Lawn",
      "95th Street Corridor",
      "Christ Hospital Area",
      "Hometown Border",
      "Chicago Ridge Border",
    ],
    metaDescription:
      "Premium airport transportation from Oak Lawn. Just 8 miles from Midway with luxury vehicles and flat-rate pricing.",
  },
  {
    name: "Tinley Park",
    slug: "tinley-park",
    region: "South Suburbs",
    distanceToOhare: "34 miles",
    distanceToMidway: "16 miles",
    neighborhoods: [
      "Downtown Tinley Park",
      "Hollywood Casino Area",
      "Oak Park Avenue Corridor",
      "Orland Hills Border",
      "Mokena Border",
    ],
    metaDescription:
      "Reliable airport car service from Tinley Park to O'Hare and Midway. Professional black car transportation with competitive rates.",
  },
  {
    name: "Homer Glen",
    slug: "homer-glen",
    region: "South Suburbs",
    distanceToOhare: "36 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Homer Township",
      "Goodings Grove",
      "Parker Road",
      "143rd Street Corridor",
      "Lockport Border",
    ],
    metaDescription:
      "Premium airport transportation from Homer Glen to Chicago airports. Door-to-door luxury black car service with professional chauffeurs.",
  },
  {
    name: "Frankfort",
    slug: "frankfort",
    region: "South Suburbs",
    distanceToOhare: "40 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "Historic Downtown Frankfort",
      "Prestwick",
      "Crystal Tree",
      "Frankfort Square",
      "Mokena Border",
    ],
    metaDescription:
      "Executive airport car service from Frankfort, IL. Professional chauffeurs providing luxury transportation to O'Hare and Midway.",
  },
  {
    name: "Mokena",
    slug: "mokena",
    region: "South Suburbs",
    distanceToOhare: "38 miles",
    distanceToMidway: "20 miles",
    neighborhoods: [
      "Downtown Mokena",
      "LaGrange Road Corridor",
      "Wolf Road",
      "Mokena Marketplace",
      "Tinley Park Border",
    ],
    metaDescription:
      "Airport black car service from Mokena to O'Hare and Midway. Reliable transportation with professional drivers and flat rates.",
  },
  {
    name: "Palos Heights",
    slug: "palos-heights",
    region: "South Suburbs",
    distanceToOhare: "28 miles",
    distanceToMidway: "12 miles",
    neighborhoods: [
      "Downtown Palos Heights",
      "Harlem Avenue Corridor",
      "Lake Katherine",
      "Trinity Christian College Area",
    ],
    metaDescription:
      "Premium airport transportation from Palos Heights to Chicago airports. Professional black car service with competitive flat-rate pricing.",
  },
  {
    name: "Palos Hills",
    slug: "palos-hills",
    region: "South Suburbs",
    distanceToOhare: "26 miles",
    distanceToMidway: "12 miles",
    neighborhoods: [
      "Downtown Palos Hills",
      "Moraine Valley Area",
      "Roberts Road Corridor",
      "Palos Heights Border",
    ],
    metaDescription:
      "Reliable airport car service from Palos Hills to O'Hare and Midway. Professional chauffeurs with flat-rate suburban pricing.",
  },
  {
    name: "Palos Park",
    slug: "palos-park",
    region: "South Suburbs",
    distanceToOhare: "28 miles",
    distanceToMidway: "14 miles",
    neighborhoods: [
      "Downtown Palos Park",
      "Forest Preserve Area",
      "Southwest Highway Corridor",
      "Orland Park Border",
    ],
    metaDescription:
      "Premium airport transportation from Palos Park to Chicago airports. Professional black car service with experienced chauffeurs.",
  },
  {
    name: "Lemont",
    slug: "lemont",
    region: "South Suburbs",
    distanceToOhare: "32 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Downtown Lemont",
      "Old Town Lemont",
      "Archer Avenue Corridor",
      "Homer Glen Border",
      "Lockport Border",
    ],
    metaDescription:
      "Executive airport car service from Lemont, IL. Luxury vehicles with professional chauffeurs to O'Hare and Midway.",
  },
  {
    name: "Evergreen Park",
    slug: "evergreen-park",
    region: "South Suburbs",
    distanceToOhare: "22 miles",
    distanceToMidway: "6 miles",
    neighborhoods: [
      "Downtown Evergreen Park",
      "95th Street Corridor",
      "Little Company of Mary Hospital Area",
      "Oak Lawn Border",
    ],
    metaDescription:
      "Airport car service from Evergreen Park. Just 6 miles from Midway with professional chauffeurs and flat-rate pricing.",
  },
  {
    name: "Chicago Ridge",
    slug: "chicago-ridge",
    region: "South Suburbs",
    distanceToOhare: "22 miles",
    distanceToMidway: "8 miles",
    neighborhoods: [
      "Chicago Ridge Mall",
      "Ridgeland Avenue Corridor",
      "Worth Border",
      "Oak Lawn Border",
    ],
    metaDescription:
      "Premium airport transportation from Chicago Ridge. Close to Midway with professional black car service and competitive rates.",
  },
  {
    name: "Alsip",
    slug: "alsip",
    region: "South Suburbs",
    distanceToOhare: "24 miles",
    distanceToMidway: "10 miles",
    neighborhoods: [
      "Cicero Avenue Corridor",
      "115th Street Area",
      "Blue Island Border",
      "Crestwood Border",
    ],
    metaDescription:
      "Reliable airport car service from Alsip to O'Hare and Midway. Professional chauffeurs with flat-rate suburban pricing.",
  },
  {
    name: "Crestwood",
    slug: "crestwood",
    region: "South Suburbs",
    distanceToOhare: "26 miles",
    distanceToMidway: "10 miles",
    neighborhoods: [
      "Crestwood Plaza",
      "Cicero Avenue Corridor",
      "Midlothian Border",
      "Alsip Border",
    ],
    metaDescription:
      "Airport transportation from Crestwood to O'Hare and Midway. Professional black car service with experienced chauffeurs.",
  },
  {
    name: "Midlothian",
    slug: "midlothian",
    region: "South Suburbs",
    distanceToOhare: "28 miles",
    distanceToMidway: "12 miles",
    neighborhoods: [
      "Downtown Midlothian",
      "147th Street Corridor",
      "Cicero Avenue Area",
      "Oak Forest Border",
    ],
    metaDescription:
      "Premium airport car service from Midlothian to Chicago airports. Professional black car transportation with flat rates.",
  },
  {
    name: "Oak Forest",
    slug: "oak-forest",
    region: "South Suburbs",
    distanceToOhare: "30 miles",
    distanceToMidway: "14 miles",
    neighborhoods: [
      "Downtown Oak Forest",
      "159th Street Corridor",
      "Central Avenue Area",
      "Tinley Park Border",
    ],
    metaDescription:
      "Reliable airport transportation from Oak Forest to O'Hare and Midway. Professional chauffeurs with competitive rates.",
  },
  {
    name: "Country Club Hills",
    slug: "country-club-hills",
    region: "South Suburbs",
    distanceToOhare: "32 miles",
    distanceToMidway: "16 miles",
    neighborhoods: [
      "183rd Street Corridor",
      "Pulaski Road Area",
      "Flossmoor Border",
      "Hazel Crest Border",
    ],
    metaDescription:
      "Airport car service from Country Club Hills to O'Hare and Midway. Professional black car transportation with flat-rate pricing.",
  },
  {
    name: "Flossmoor",
    slug: "flossmoor",
    region: "South Suburbs",
    distanceToOhare: "32 miles",
    distanceToMidway: "16 miles",
    neighborhoods: [
      "Downtown Flossmoor",
      "Flossmoor Road Corridor",
      "Homewood Border",
      "Olympia Fields Border",
    ],
    metaDescription:
      "Premium airport transportation from Flossmoor to Chicago airports. Executive black car service with experienced chauffeurs.",
  },
  {
    name: "Homewood",
    slug: "homewood",
    region: "South Suburbs",
    distanceToOhare: "30 miles",
    distanceToMidway: "14 miles",
    neighborhoods: [
      "Downtown Homewood",
      "Ridge Road Corridor",
      "183rd Street Area",
      "Flossmoor Border",
    ],
    metaDescription:
      "Reliable airport car service from Homewood to O'Hare and Midway. Professional chauffeurs with flat-rate suburban pricing.",
  },
  {
    name: "Olympia Fields",
    slug: "olympia-fields",
    region: "South Suburbs",
    distanceToOhare: "34 miles",
    distanceToMidway: "18 miles",
    neighborhoods: [
      "Olympia Fields Country Club",
      "Western Avenue Corridor",
      "Flossmoor Border",
      "Matteson Border",
    ],
    metaDescription:
      "Executive airport car service from Olympia Fields, IL. Luxury vehicles with professional chauffeurs to O'Hare and Midway.",
  },

  // Far West Suburbs
  {
    name: "Aurora",
    slug: "aurora",
    region: "Far West Suburbs",
    distanceToOhare: "38 miles",
    distanceToMidway: "32 miles",
    neighborhoods: [
      "Downtown Aurora",
      "Fox Valley Mall",
      "North Aurora Border",
      "Naperville Border",
      "Oswego Border",
    ],
    metaDescription:
      "Airport car service from Aurora, IL to O'Hare and Midway. Professional black car transportation with flat-rate pricing.",
  },
  {
    name: "Oswego",
    slug: "oswego",
    region: "Far West Suburbs",
    distanceToOhare: "42 miles",
    distanceToMidway: "34 miles",
    neighborhoods: [
      "Downtown Oswego",
      "Route 34 Corridor",
      "Waubonsee Community College Area",
      "Aurora Border",
    ],
    metaDescription:
      "Premium airport transportation from Oswego to Chicago airports. Professional black car service with experienced chauffeurs.",
  },
  {
    name: "Plainfield",
    slug: "plainfield",
    region: "Far West Suburbs",
    distanceToOhare: "40 miles",
    distanceToMidway: "30 miles",
    neighborhoods: [
      "Downtown Plainfield",
      "Route 59 Corridor",
      "Caton Farm Area",
      "Romeoville Border",
      "Joliet Border",
    ],
    metaDescription:
      "Reliable airport car service from Plainfield to O'Hare and Midway. Professional chauffeurs with competitive flat-rate pricing.",
  },
  {
    name: "Bolingbrook",
    slug: "bolingbrook",
    region: "Far West Suburbs",
    distanceToOhare: "30 miles",
    distanceToMidway: "22 miles",
    neighborhoods: [
      "The Promenade",
      "Boughton Road Corridor",
      "Route 53 Area",
      "Romeoville Border",
      "Woodridge Border",
    ],
    metaDescription:
      "Airport transportation from Bolingbrook to O'Hare and Midway. Professional black car service with flat-rate suburban pricing.",
  },
  {
    name: "Romeoville",
    slug: "romeoville",
    region: "Far West Suburbs",
    distanceToOhare: "32 miles",
    distanceToMidway: "24 miles",
    neighborhoods: [
      "Downtown Romeoville",
      "Weber Road Corridor",
      "Lewis University Area",
      "Bolingbrook Border",
    ],
    metaDescription:
      "Premium airport car service from Romeoville to Chicago airports. Professional chauffeurs with competitive rates.",
  },
  {
    name: "Lockport",
    slug: "lockport",
    region: "Far West Suburbs",
    distanceToOhare: "38 miles",
    distanceToMidway: "24 miles",
    neighborhoods: [
      "Downtown Lockport",
      "Historic Canal Area",
      "159th Street Corridor",
      "Homer Glen Border",
      "Lemont Border",
    ],
    metaDescription:
      "Reliable airport transportation from Lockport to O'Hare and Midway. Professional black car service with experienced chauffeurs.",
  },
  {
    name: "St. Charles",
    slug: "st-charles",
    region: "Far West Suburbs",
    distanceToOhare: "32 miles",
    distanceToMidway: "42 miles",
    neighborhoods: [
      "Downtown St. Charles",
      "First Street",
      "Fox River Area",
      "Geneva Border",
      "Wayne Border",
    ],
    metaDescription:
      "Executive airport car service from St. Charles, IL. Luxury vehicles with professional chauffeurs to O'Hare and Midway.",
  },
  {
    name: "Geneva",
    slug: "geneva",
    region: "Far West Suburbs",
    distanceToOhare: "34 miles",
    distanceToMidway: "38 miles",
    neighborhoods: [
      "Downtown Geneva",
      "Third Street",
      "Fox River Area",
      "St. Charles Border",
      "Batavia Border",
    ],
    metaDescription:
      "Premium airport transportation from Geneva to Chicago airports. Professional black car service with flat-rate pricing.",
  },
  {
    name: "Batavia",
    slug: "batavia",
    region: "Far West Suburbs",
    distanceToOhare: "36 miles",
    distanceToMidway: "36 miles",
    neighborhoods: [
      "Downtown Batavia",
      "Randall Road Corridor",
      "Fox River Area",
      "Geneva Border",
      "Aurora Border",
    ],
    metaDescription:
      "Reliable airport car service from Batavia to O'Hare and Midway. Professional chauffeurs with competitive rates.",
  },
  {
    name: "Carol Stream",
    slug: "carol-stream",
    region: "Far West Suburbs",
    distanceToOhare: "22 miles",
    distanceToMidway: "26 miles",
    neighborhoods: [
      "Downtown Carol Stream",
      "North Avenue Corridor",
      "Army Trail Road",
      "Wheaton Border",
      "Glendale Heights Border",
    ],
    metaDescription:
      "Airport transportation from Carol Stream to O'Hare and Midway. Professional black car service with flat-rate pricing.",
  },
  {
    name: "Glendale Heights",
    slug: "glendale-heights",
    region: "Far West Suburbs",
    distanceToOhare: "18 miles",
    distanceToMidway: "24 miles",
    neighborhoods: [
      "Downtown Glendale Heights",
      "North Avenue Corridor",
      "Army Trail Road",
      "Glen Ellyn Border",
      "Carol Stream Border",
    ],
    metaDescription:
      "Premium airport car service from Glendale Heights to Chicago airports. Professional chauffeurs with competitive rates.",
  },
  {
    name: "Bloomingdale",
    slug: "bloomingdale",
    region: "Far West Suburbs",
    distanceToOhare: "16 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Stratford Square Mall",
      "Lake Street Corridor",
      "Army Trail Road",
      "Roselle Border",
      "Glendale Heights Border",
    ],
    metaDescription:
      "Reliable airport transportation from Bloomingdale to O'Hare and Midway. Professional black car service with flat rates.",
  },
  {
    name: "Roselle",
    slug: "roselle",
    region: "Far West Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "26 miles",
    neighborhoods: [
      "Downtown Roselle",
      "Irving Park Corridor",
      "Lake Street Area",
      "Bloomingdale Border",
      "Schaumburg Border",
    ],
    metaDescription:
      "Airport car service from Roselle to O'Hare and Midway. Professional chauffeurs with flat-rate suburban pricing.",
  },
  {
    name: "Hanover Park",
    slug: "hanover-park",
    region: "Far West Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Downtown Hanover Park",
      "Irving Park Corridor",
      "Ontarioville",
      "Bartlett Border",
      "Streamwood Border",
    ],
    metaDescription:
      "Premium airport transportation from Hanover Park to Chicago airports. Professional black car service with competitive rates.",
  },
  {
    name: "Bartlett",
    slug: "bartlett",
    region: "Far West Suburbs",
    distanceToOhare: "16 miles",
    distanceToMidway: "30 miles",
    neighborhoods: [
      "Downtown Bartlett",
      "Stearns Road Corridor",
      "Lake Street Area",
      "Hanover Park Border",
      "Carol Stream Border",
    ],
    metaDescription:
      "Reliable airport car service from Bartlett to O'Hare and Midway. Professional chauffeurs with flat-rate pricing.",
  },
  {
    name: "Streamwood",
    slug: "streamwood",
    region: "Far West Suburbs",
    distanceToOhare: "14 miles",
    distanceToMidway: "30 miles",
    neighborhoods: [
      "Downtown Streamwood",
      "Irving Park Corridor",
      "Schaumburg Road Area",
      "Hanover Park Border",
      "Bartlett Border",
    ],
    metaDescription:
      "Airport transportation from Streamwood to O'Hare and Midway. Professional black car service with experienced chauffeurs.",
  },

  // Southwest Suburbs
  {
    name: "Joliet",
    slug: "joliet",
    region: "Southwest Suburbs",
    distanceToOhare: "48 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Downtown Joliet",
      "Louis Joliet Mall",
      "Harrah's Casino Area",
      "Plainfield Border",
      "Shorewood Border",
    ],
    metaDescription:
      "Premium airport car service from Joliet, IL to O'Hare and Midway. Professional chauffeurs with flat-rate pricing.",
  },
  {
    name: "New Lenox",
    slug: "new-lenox",
    region: "Southwest Suburbs",
    distanceToOhare: "42 miles",
    distanceToMidway: "24 miles",
    neighborhoods: [
      "Downtown New Lenox",
      "US Route 30 Corridor",
      "Lincoln Way Area",
      "Mokena Border",
      "Joliet Border",
    ],
    metaDescription:
      "Reliable airport transportation from New Lenox to O'Hare and Midway. Professional black car service with competitive rates.",
  },
  {
    name: "Shorewood",
    slug: "shorewood",
    region: "Southwest Suburbs",
    distanceToOhare: "44 miles",
    distanceToMidway: "26 miles",
    neighborhoods: [
      "Downtown Shorewood",
      "Route 59 Corridor",
      "Black Road Area",
      "Joliet Border",
      "Plainfield Border",
    ],
    metaDescription:
      "Airport car service from Shorewood to O'Hare and Midway. Professional chauffeurs with flat-rate suburban pricing.",
  },
  {
    name: "Minooka",
    slug: "minooka",
    region: "Southwest Suburbs",
    distanceToOhare: "52 miles",
    distanceToMidway: "34 miles",
    neighborhoods: [
      "Downtown Minooka",
      "Ridge Road Corridor",
      "Channahon Border",
      "Shorewood Border",
    ],
    metaDescription:
      "Premium airport transportation from Minooka to Chicago airports. Professional black car service with experienced chauffeurs.",
  },
  {
    name: "Manhattan",
    slug: "manhattan",
    region: "Southwest Suburbs",
    distanceToOhare: "46 miles",
    distanceToMidway: "28 miles",
    neighborhoods: [
      "Downtown Manhattan",
      "Route 52 Corridor",
      "Elwood Border",
      "Mokena Border",
    ],
    metaDescription:
      "Reliable airport car service from Manhattan, IL to O'Hare and Midway. Professional chauffeurs with competitive rates.",
  },
  {
    name: "Channahon",
    slug: "channahon",
    region: "Southwest Suburbs",
    distanceToOhare: "50 miles",
    distanceToMidway: "32 miles",
    neighborhoods: [
      "Downtown Channahon",
      "Route 6 Corridor",
      "I&M Canal Area",
      "Minooka Border",
      "Joliet Border",
    ],
    metaDescription:
      "Airport transportation from Channahon to O'Hare and Midway. Professional black car service with flat-rate pricing.",
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug);
}

export function getCitiesByRegion(region: City["region"]): City[] {
  return cities.filter((city) => city.region === region);
}

export function getRelatedCities(
  currentSlug: string,
  limit: number = 6,
): City[] {
  const currentCity = getCityBySlug(currentSlug);
  if (!currentCity) return [];

  const sameRegion = cities.filter(
    (c) => c.region === currentCity.region && c.slug !== currentSlug,
  );
  const otherCities = cities.filter(
    (c) => c.region !== currentCity.region && c.slug !== currentSlug,
  );

  const result = [
    ...sameRegion.slice(0, Math.ceil(limit / 2)),
    ...otherCities.slice(0, Math.floor(limit / 2)),
  ];
  return result.slice(0, limit);
}

export const popularCities = [
  "naperville",
  "schaumburg",
  "evanston",
  "oak-brook",
  "arlington-heights",
  "highland-park",
  "orland-park",
  "hinsdale",
  "aurora",
  "joliet",
  "des-plaines",
  "oak-park",
];

export const allRegions: City["region"][] = [
  "North Shore",
  "West Suburbs",
  "Northwest Suburbs",
  "South Suburbs",
  "Southwest Suburbs",
  "Far West Suburbs",
];
