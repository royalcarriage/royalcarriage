const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({ projectId: "royalcarriagelimoseo" });
}
const db = admin.firestore();

// Chicago Area Events for 2026 (Jan-Jun)
const CHICAGO_EVENTS = [
  // January
  {
    id: "chicago-restaurant-week-2026",
    name: "Chicago Restaurant Week",
    slug: "chicago-restaurant-week",
    description:
      "Sample Chicago's finest cuisine with special prix-fixe menus at top restaurants throughout the city.",
    location: "Citywide Chicago",
    locationSlug: "chicago",
    startDate: "2026-01-23",
    endDate: "2026-02-08",
    category: "food-dining",
    venues: ["Various Chicago Restaurants"],
    transportationTips:
      "Book a luxury sedan for a memorable dining experience. Our chauffeurs know the best routes to avoid downtown traffic.",
    recommendedServices: [
      "airport-dining",
      "corporate-dinner",
      "point-to-point",
    ],
    recommendedVehicles: ["sedan", "luxury-sedan", "suv"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Frestaurant-week.jpg?alt=media",
    featured: true,
  },
  {
    id: "chicago-auto-show-2026",
    name: "Chicago Auto Show",
    slug: "chicago-auto-show",
    description:
      "The largest auto show in North America featuring the latest vehicles from top manufacturers.",
    location: "McCormick Place, Chicago",
    locationSlug: "mccormick-place",
    startDate: "2026-02-14",
    endDate: "2026-02-23",
    category: "convention",
    venues: ["McCormick Place"],
    transportationTips:
      "Avoid parking hassles at McCormick Place. Our drivers drop you at the entrance and pick you up when you're ready.",
    recommendedServices: [
      "point-to-point",
      "hourly-charter",
      "corporate-event",
    ],
    recommendedVehicles: ["sedan", "suv", "van"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Fauto-show.jpg?alt=media",
    featured: true,
  },
  // February
  {
    id: "chicago-theatre-week-2026",
    name: "Chicago Theatre Week",
    slug: "chicago-theatre-week",
    description:
      "Enjoy discounted tickets to over 100 productions at theaters throughout Chicago.",
    location: "Chicago Loop & Theaters",
    locationSlug: "downtown",
    startDate: "2026-02-13",
    endDate: "2026-02-23",
    category: "entertainment",
    venues: ["Various Chicago Theaters"],
    transportationTips:
      "Arrive in style for your theater night. We'll drop you at the door and wait nearby for your show to end.",
    recommendedServices: ["point-to-point", "hourly-charter"],
    recommendedVehicles: ["sedan", "luxury-sedan"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Ftheater-week.jpg?alt=media",
    featured: false,
  },
  // March
  {
    id: "st-patricks-day-parade-2026",
    name: "St. Patrick's Day Parade & River Dyeing",
    slug: "st-patricks-day-chicago",
    description:
      "Watch the Chicago River turn green and enjoy the famous downtown parade celebrating Irish heritage.",
    location: "Downtown Chicago",
    locationSlug: "downtown",
    startDate: "2026-03-14",
    endDate: "2026-03-14",
    category: "festival",
    venues: ["Chicago River", "Columbus Drive"],
    transportationTips:
      "Downtown parking is impossible during St. Patrick's Day. Let us handle transportation so your group can celebrate safely.",
    recommendedServices: ["party-bus", "group-transportation"],
    recommendedVehicles: ["partyBus", "van", "suv"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Fst-patricks.jpg?alt=media",
    featured: true,
  },
  // April
  {
    id: "chicago-cubs-opening-day-2026",
    name: "Chicago Cubs Opening Day",
    slug: "cubs-opening-day",
    description:
      "Kick off baseball season at historic Wrigley Field with the Chicago Cubs.",
    location: "Wrigley Field, Chicago",
    locationSlug: "wrigleyville",
    startDate: "2026-04-02",
    endDate: "2026-04-02",
    category: "sports",
    venues: ["Wrigley Field"],
    transportationTips:
      "Skip the Wrigleyville parking nightmare. We drop you steps from Wrigley and pick you up after the last pitch.",
    recommendedServices: [
      "point-to-point",
      "party-bus",
      "group-transportation",
    ],
    recommendedVehicles: ["suv", "van", "partyBus"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Fcubs-game.jpg?alt=media",
    featured: true,
  },
  // May
  {
    id: "lincoln-park-mayfest-2026",
    name: "Lincoln Park Mayfest",
    slug: "lincoln-park-mayfest",
    description:
      "Kick off summer in the heart of historic Lincoln Park with live music, drinks, art shows, and local vendors.",
    location: "Lincoln Park, Chicago",
    locationSlug: "lincoln-park",
    startDate: "2026-05-15",
    endDate: "2026-05-17",
    category: "festival",
    venues: ["Lincoln Park"],
    transportationTips:
      "Enjoy the festival without worrying about parking. Our drivers know the best drop-off points near the action.",
    recommendedServices: ["point-to-point", "group-transportation"],
    recommendedVehicles: ["suv", "van"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Fmayfest.jpg?alt=media",
    featured: false,
  },
  {
    id: "naperville-food-truck-festival-2026",
    name: "Naperville Food Truck Spring Festival",
    slug: "naperville-food-truck-festival",
    description:
      "Sample delicious fare from the best food trucks in the Chicago area at this Naperville celebration.",
    location: "Downtown Naperville",
    locationSlug: "naperville",
    startDate: "2026-05-02",
    endDate: "2026-05-02",
    category: "food-dining",
    venues: ["Downtown Naperville"],
    transportationTips:
      "Coming from O'Hare or Midway? Book our Naperville airport transfer and arrive stress-free.",
    recommendedServices: ["airport-transfer", "point-to-point"],
    recommendedVehicles: ["sedan", "suv"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Ffood-truck.jpg?alt=media",
    featured: false,
  },
  // June
  {
    id: "naperville-ribfest-2026",
    name: "Naperville Ribfest",
    slug: "naperville-ribfest",
    description:
      "Experience award-winning BBQ, live music, and family fun at the 33rd annual Ribfest over Father's Day weekend.",
    location: "Naperville",
    locationSlug: "naperville",
    startDate: "2026-06-19",
    endDate: "2026-06-21",
    category: "festival",
    venues: ["Knoch Park, Naperville"],
    transportationTips:
      "Bring the whole family! Our SUVs and vans are perfect for groups heading to Ribfest from anywhere in Chicagoland.",
    recommendedServices: [
      "group-transportation",
      "point-to-point",
      "airport-transfer",
    ],
    recommendedVehicles: ["suv", "van", "luxury-suv"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Fribfest.jpg?alt=media",
    featured: true,
  },
  {
    id: "chicago-pride-fest-2026",
    name: "Chicago Pride Fest & Parade",
    slug: "chicago-pride",
    description:
      "Celebrate Pride in the country's oldest official gay neighborhood with one of the largest Pride celebrations in the world.",
    location: "Boystown, Chicago",
    locationSlug: "lakeview",
    startDate: "2026-06-20",
    endDate: "2026-06-28",
    category: "festival",
    venues: ["Halsted Street", "Various Boystown venues"],
    transportationTips:
      "Book a party bus for your Pride celebration! Our buses are perfect for groups wanting to bar hop and celebrate safely.",
    recommendedServices: ["party-bus", "group-transportation", "bar-crawl"],
    recommendedVehicles: ["partyBus", "van", "stretch-limo"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Fpride-fest.jpg?alt=media",
    featured: true,
  },
  {
    id: "ed-sheeran-soldier-field-2026",
    name: "Ed Sheeran at Soldier Field",
    slug: "ed-sheeran-chicago",
    description:
      "Ed Sheeran brings The Loop Tour to Soldier Field for an unforgettable concert experience.",
    location: "Soldier Field, Chicago",
    locationSlug: "soldier-field",
    startDate: "2026-06-27",
    endDate: "2026-06-27",
    category: "concert",
    venues: ["Soldier Field"],
    transportationTips:
      "Skip the post-concert traffic nightmare. Our driver waits nearby and picks you up right after the show.",
    recommendedServices: [
      "point-to-point",
      "hourly-charter",
      "group-transportation",
    ],
    recommendedVehicles: ["suv", "van", "partyBus"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Fconcert.jpg?alt=media",
    featured: true,
  },
  // Naperville Events
  {
    id: "naperville-last-fling-2026",
    name: "Naperville Jaycees Last Fling",
    slug: "naperville-last-fling",
    description:
      "Four-day family-friendly community event over Labor Day weekend featuring carnival, national artists, beer gardens, and Illinois' largest Labor Day parade.",
    location: "Downtown Naperville",
    locationSlug: "naperville",
    startDate: "2026-09-04",
    endDate: "2026-09-07",
    category: "festival",
    venues: ["Downtown Naperville"],
    transportationTips:
      "Hosting out-of-town guests for Labor Day? Book airport transfers from O'Hare to Naperville with ease.",
    recommendedServices: [
      "airport-transfer",
      "group-transportation",
      "point-to-point",
    ],
    recommendedVehicles: ["sedan", "suv", "van"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/events%2Flast-fling.jpg?alt=media",
    featured: true,
  },
];

// City-specific content with events and limo service reasons
const CITY_CONTENT = {
  naperville: {
    name: "Naperville",
    slug: "naperville",
    tagline: "The Heart of the Western Suburbs",
    description:
      "Naperville is one of Chicago's most vibrant suburbs, known for its beautiful Riverwalk, thriving downtown, excellent schools, and year-round festivals. From Ribfest to Last Fling, Naperville hosts some of the region's best events.",
    whyLimoService: [
      "Naperville is approximately 30 miles from O'Hare Airport - our flat-rate pricing makes airport transfers predictable and stress-free.",
      "Downtown Naperville parking is limited during festivals like Ribfest and Last Fling. Skip the hassle with door-to-door service.",
      "Many corporate headquarters are located in Naperville's business parks. Our executive car service is perfect for client transportation.",
      "Naperville's beautiful wedding venues, including riverfront locations, deserve elegant transportation to match.",
      "The city's vibrant nightlife and dining scene on Main Street is best enjoyed without worrying about designated drivers.",
    ],
    popularRoutes: [
      {
        from: "Naperville",
        to: "O'Hare Airport",
        time: "35-50 min",
        distance: "30 miles",
      },
      {
        from: "Naperville",
        to: "Midway Airport",
        time: "30-40 min",
        distance: "25 miles",
      },
      {
        from: "Naperville",
        to: "Downtown Chicago",
        time: "40-55 min",
        distance: "32 miles",
      },
      {
        from: "Naperville",
        to: "McCormick Place",
        time: "35-50 min",
        distance: "30 miles",
      },
    ],
    landmarks: [
      "Naperville Riverwalk",
      "Centennial Beach",
      "Naper Settlement",
      "Downtown Naperville",
      "DuPage Children's Museum",
    ],
    nearbyVenues: [
      "Hotel Arista",
      "Westin Chicago Lombard",
      "Meson Sabika",
      "Maggiano's",
      "Sullivan's Steakhouse",
    ],
  },
  schaumburg: {
    name: "Schaumburg",
    slug: "schaumburg",
    tagline: "Shopping, Dining & Entertainment Hub",
    description:
      "Schaumburg is home to Woodfield Mall, one of the largest shopping centers in the US, plus a thriving restaurant scene and the Schaumburg Boomers baseball team.",
    whyLimoService: [
      "Schaumburg is just 10 minutes from O'Hare Airport, making it perfect for business travelers and shopping tourists.",
      "Woodfield Mall attracts shoppers from across the Midwest - arrive refreshed after a comfortable ride.",
      "The Convention Center and corporate headquarters make Schaumburg a hub for business travel.",
      "Enjoy Schaumburg's restaurant row without worrying about parking or designated drivers.",
      "Boomers games at Wintrust Field are more fun when everyone can enjoy the festivities.",
    ],
    popularRoutes: [
      {
        from: "Schaumburg",
        to: "O'Hare Airport",
        time: "15-25 min",
        distance: "8 miles",
      },
      {
        from: "Schaumburg",
        to: "Downtown Chicago",
        time: "35-50 min",
        distance: "28 miles",
      },
      {
        from: "Schaumburg",
        to: "Midway Airport",
        time: "40-55 min",
        distance: "30 miles",
      },
    ],
    landmarks: [
      "Woodfield Mall",
      "Wintrust Field",
      "Legoland Discovery Center",
      "Medieval Times",
      "Streets of Woodfield",
    ],
    nearbyVenues: [
      "Renaissance Schaumburg",
      "Hyatt Regency Schaumburg",
      "Capital Grille",
      "Weber Grill",
    ],
  },
  evanston: {
    name: "Evanston",
    slug: "evanston",
    tagline: "Where Culture Meets Lake Michigan",
    description:
      "Evanston is home to Northwestern University, beautiful lakefront parks, and a vibrant downtown with diverse dining and shopping options.",
    whyLimoService: [
      "Northwestern University events, graduations, and football games deserve elegant transportation.",
      "Evanston's lakefront dining and entertainment district is best enjoyed without parking worries.",
      "Airport transfers to O'Hare are quick and comfortable from Evanston.",
      "The city hosts numerous festivals and cultural events throughout the year.",
      "Corporate clients visiting Northwestern or downtown Evanston appreciate professional chauffeur service.",
    ],
    popularRoutes: [
      {
        from: "Evanston",
        to: "O'Hare Airport",
        time: "25-40 min",
        distance: "18 miles",
      },
      {
        from: "Evanston",
        to: "Downtown Chicago",
        time: "20-35 min",
        distance: "12 miles",
      },
      {
        from: "Evanston",
        to: "Midway Airport",
        time: "35-50 min",
        distance: "22 miles",
      },
    ],
    landmarks: [
      "Northwestern University",
      "Baha'i Temple",
      "Lighthouse Beach",
      "Downtown Evanston",
      "Grosse Point Lighthouse",
    ],
    nearbyVenues: [
      "Hilton Orrington/Evanston",
      "Hotel Orrington",
      "Found Kitchen",
      "Oceanique",
    ],
  },
};

// Blog posts with images
const BLOG_POSTS = [
  {
    id: "why-naperville-loves-limo-service",
    title: "Why Naperville Residents Love Luxury Limousine Service",
    slug: "why-naperville-loves-limo-service",
    excerpt:
      "From Ribfest to O'Hare transfers, discover why Naperville is one of our most popular service areas.",
    content: `
      <p class="lead">Naperville consistently ranks as one of the best places to live in America, and its residents appreciate the finer things in life - including professional limousine service.</p>

      <h2>Festival Season Transportation</h2>
      <p>Naperville hosts some of the Chicago area's most popular festivals, including Ribfest over Father's Day weekend and Last Fling during Labor Day. These events draw hundreds of thousands of visitors, making parking nearly impossible. Smart festival-goers book our SUVs and party buses for hassle-free transportation to and from the festivities.</p>

      <h2>O'Hare Airport Transfers</h2>
      <p>Located approximately 30 miles from O'Hare International Airport, Naperville residents rely on our flat-rate airport transfer service. Whether you're catching an early morning flight or arriving late at night, our professional chauffeurs ensure you arrive on time and relaxed. No more asking friends for rides or dealing with expensive airport parking.</p>

      <h2>Downtown Naperville Nightlife</h2>
      <p>The city's thriving downtown features dozens of restaurants, bars, and entertainment venues along Main Street and the surrounding area. Our sedan and SUV services are perfect for date nights, anniversary dinners, or group outings where everyone wants to enjoy themselves without worrying about driving.</p>

      <h2>Wedding Transportation</h2>
      <p>Naperville's beautiful wedding venues - from the Riverwalk to elegant ballrooms - deserve transportation to match. Our stretch limousines and luxury SUVs have transported countless bridal parties, ensuring the special day starts and ends in style.</p>

      <h2>Corporate Travel</h2>
      <p>Many Fortune 500 companies have offices in Naperville's business parks. Our executive car service provides reliable, professional transportation for executives, clients, and visiting dignitaries. Corporate accounts enjoy convenient billing and priority booking.</p>
    `,
    author: "Royal Carriage Team",
    publishDate: "2026-01-15",
    category: "city-guide",
    tags: ["naperville", "airport-transfer", "festivals", "wedding"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/blog%2Fnaperville-riverwalk.jpg?alt=media",
    websiteIds: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
      "chicago-partybus",
    ],
  },
  {
    id: "chicago-events-2026-transportation-guide",
    title: "Chicago Events 2026: Your Complete Transportation Guide",
    slug: "chicago-events-2026-transportation-guide",
    excerpt:
      "Plan your transportation for Chicago's biggest events in 2026, from Restaurant Week to Pride Fest.",
    content: `
      <p class="lead">Chicago's event calendar for 2026 is packed with festivals, concerts, and celebrations. Here's your complete guide to navigating transportation for the year's biggest events.</p>

      <h2>January: Chicago Restaurant Week (Jan 23 - Feb 8)</h2>
      <p>Sample prix-fixe menus at Chicago's finest restaurants. Book a luxury sedan for your dining experience - our chauffeurs know the best routes and can recommend nearby parking-free dining options.</p>

      <h2>February: Chicago Auto Show (Feb 14-23)</h2>
      <p>The nation's largest auto show at McCormick Place draws car enthusiasts from around the world. Skip the parking hassle with our drop-off service right at the entrance.</p>

      <h2>March: St. Patrick's Day (March 14)</h2>
      <p>The river goes green and downtown becomes a sea of celebration. Our party buses are perfect for groups wanting to bar hop safely while enjoying the festivities.</p>

      <h2>April: Cubs Opening Day</h2>
      <p>Baseball is back at Wrigley Field! Avoid the notorious Wrigleyville parking situation with our convenient drop-off and pickup service.</p>

      <h2>June: Ribfest & Pride Fest</h2>
      <p>Whether you're heading to Naperville for Ribfest or celebrating Pride in Boystown, our fleet has you covered. Party buses are especially popular for Pride weekend celebrations.</p>
    `,
    author: "Royal Carriage Team",
    publishDate: "2026-01-10",
    category: "events",
    tags: ["chicago", "events", "festivals", "2026"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/blog%2Fchicago-skyline.jpg?alt=media",
    websiteIds: [
      "chicagoairportblackcar",
      "chicagoexecutivecarservice",
      "chicagoweddingtransportation",
      "chicago-partybus",
    ],
  },
  {
    id: "party-bus-chicago-nightlife-guide",
    title: "The Ultimate Chicago Party Bus Nightlife Guide",
    slug: "party-bus-chicago-nightlife-guide",
    excerpt:
      "Experience Chicago's best nightlife neighborhoods by party bus - the ultimate way to bar hop with your crew.",
    content: `
      <p class="lead">Chicago's nightlife scene is legendary, from River North's upscale clubs to Wicker Park's trendy bars. A party bus transforms your night out into an unforgettable experience.</p>

      <h2>River North: Chicago's Premier Nightlife District</h2>
      <p>Home to some of the city's most exclusive clubs and rooftop bars, River North is where Chicago comes to party. Popular stops include TAO Chicago, Celeste, and Sound-Bar. Our party buses feature LED lighting, premium sound systems, and BYOB capability to keep the party going between venues.</p>

      <h2>Wicker Park & Bucktown</h2>
      <p>For a more eclectic vibe, Wicker Park offers dive bars, craft cocktail lounges, and live music venues. Hit spots like The Violet Hour, Emporium Arcade Bar, and Double Door's new location.</p>

      <h2>Wrigleyville Game Day</h2>
      <p>Cubs games and Wrigleyville's famous bar scene go hand in hand. Book a party bus for your group, enjoy the game, then hit the nearby bars without anyone having to drive.</p>

      <h2>Bachelor & Bachelorette Parties</h2>
      <p>Our party buses are the number one choice for wedding party celebrations. The party starts the moment everyone boards, and continues safely throughout the night with a professional driver at the wheel.</p>
    `,
    author: "Royal Carriage Team",
    publishDate: "2026-01-08",
    category: "party-bus",
    tags: ["party-bus", "nightlife", "bachelor-party", "bachelorette"],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/royalcarriagelimoseo.firebasestorage.app/o/blog%2Fparty-bus-interior.jpg?alt=media",
    websiteIds: ["chicago-partybus"],
  },
];

async function seedEvents() {
  console.log("=== SEEDING EVENTS ===");
  const batch = db.batch();

  for (const event of CHICAGO_EVENTS) {
    const docRef = db.collection("events").doc(event.id);
    batch.set(
      docRef,
      {
        ...event,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    );
    console.log(`  Added event: ${event.name}`);
  }

  await batch.commit();
  console.log(`\nSeeded ${CHICAGO_EVENTS.length} events`);
}

async function seedCityContent() {
  console.log("\n=== SEEDING CITY CONTENT ===");
  const batch = db.batch();

  for (const [slug, city] of Object.entries(CITY_CONTENT)) {
    const docRef = db.collection("city_content").doc(slug);
    batch.set(
      docRef,
      {
        ...city,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    );
    console.log(`  Added city content: ${city.name}`);
  }

  await batch.commit();
  console.log(
    `\nSeeded ${Object.keys(CITY_CONTENT).length} city content pages`,
  );
}

async function seedBlogPosts() {
  console.log("\n=== SEEDING BLOG POSTS ===");
  const batch = db.batch();

  for (const post of BLOG_POSTS) {
    const docRef = db.collection("blog_posts").doc(post.id);
    batch.set(
      docRef,
      {
        ...post,
        status: "published",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    );
    console.log(`  Added blog post: ${post.title}`);
  }

  await batch.commit();
  console.log(`\nSeeded ${BLOG_POSTS.length} blog posts`);
}

async function updateLocationsWithEvents() {
  console.log("\n=== UPDATING LOCATIONS WITH EVENTS ===");

  // Get all locations
  const locSnap = await db.collection("locations").get();
  let batch = db.batch();
  let count = 0;

  for (const doc of locSnap.docs) {
    const loc = doc.data();
    const slug = loc.slug || doc.id;

    // Find events for this location
    const locationEvents = CHICAGO_EVENTS.filter(
      (e) =>
        e.locationSlug === slug ||
        e.location.toLowerCase().includes(loc.name?.toLowerCase() || ""),
    );

    // Get city content if available
    const cityContent = CITY_CONTENT[slug];

    if (locationEvents.length > 0 || cityContent) {
      batch.update(doc.ref, {
        events: locationEvents.map((e) => e.id),
        hasEvents: locationEvents.length > 0,
        cityContent: cityContent
          ? {
              tagline: cityContent.tagline,
              whyLimoService: cityContent.whyLimoService,
              popularRoutes: cityContent.popularRoutes,
              landmarks: cityContent.landmarks,
            }
          : null,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      console.log(`  Updated ${loc.name}: ${locationEvents.length} events`);
      count++;

      if (count % 400 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
  }

  if (count % 400 !== 0) {
    await batch.commit();
  }

  console.log(`\nUpdated ${count} locations with events`);
}

async function main() {
  try {
    await seedEvents();
    await seedCityContent();
    await seedBlogPosts();
    await updateLocationsWithEvents();

    console.log("\n=== ALL SEEDING COMPLETE ===");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
