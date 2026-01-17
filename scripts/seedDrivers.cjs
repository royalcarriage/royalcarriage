/**
 * Seed Sample Drivers
 * Creates sample driver records in Firestore for Royal Carriage
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({ projectId: "royalcarriagelimoseo" });
}

const db = admin.firestore();

// Sample driver data
const SAMPLE_DRIVERS = [
  {
    personalInfo: {
      firstName: "Marcus",
      lastName: "Johnson",
      email: "marcus.johnson@royalcarriage.com",
      phone: "(312) 555-0101",
      dateOfBirth: new Date("1985-03-15"),
      licenseNumber: "D400-5551-0101",
      licenseState: "IL",
      licenseExpiration: new Date("2027-03-15"),
      ssn: "***-**-1234", // Masked
    },
    employment: {
      status: "active",
      hireDate: new Date("2020-06-01"),
      terminationDate: null,
      employmentType: "employee",
    },
    documents: {
      licenseImage: "/drivers/marcus-johnson/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2020-05-15"),
        expirationDate: new Date("2025-05-15"),
        provider: "Checkr",
      },
      certifications: [
        {
          name: "Defensive Driving",
          issueDate: new Date("2021-01-10"),
          expirationDate: new Date("2026-01-10"),
          documentUrl: "/drivers/marcus-johnson/certs/defensive-driving.pdf",
        },
        {
          name: "CDL Class B",
          issueDate: new Date("2019-06-01"),
          expirationDate: new Date("2027-06-01"),
          documentUrl: "/drivers/marcus-johnson/certs/cdl.pdf",
        },
      ],
      insuranceCard: "/drivers/marcus-johnson/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 2847,
      completedRides: 2789,
      cancelledRides: 58,
      averageRating: 4.9,
      totalRatings: 2456,
      acceptanceRate: 96,
      cancellationRate: 2,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 25,
      payStructure: "percentage",
      payPercentage: 75,
      deductions: [],
    },
    availability: {
      currentStatus: "online",
      availableVehicleIds: [
        "lincoln-continental",
        "cadillac-xts",
        "mercedes-s-class",
      ],
      schedule: [
        {
          dayOfWeek: 0,
          startTime: "08:00",
          endTime: "18:00",
          isWorking: false,
        },
        { dayOfWeek: 1, startTime: "06:00", endTime: "18:00", isWorking: true },
        { dayOfWeek: 2, startTime: "06:00", endTime: "18:00", isWorking: true },
        { dayOfWeek: 3, startTime: "06:00", endTime: "18:00", isWorking: true },
        { dayOfWeek: 4, startTime: "06:00", endTime: "18:00", isWorking: true },
        { dayOfWeek: 5, startTime: "06:00", endTime: "20:00", isWorking: true },
        { dayOfWeek: 6, startTime: "07:00", endTime: "17:00", isWorking: true },
      ],
    },
    ratings: {
      totalRatings: 2456,
      averageRating: 4.9,
      byCategory: {
        cleanliness: 4.95,
        professionalism: 4.92,
        safetyDriving: 4.88,
        customerService: 4.9,
      },
    },
    vehicleTypes: ["sedan", "suv"],
    specializations: ["airport", "corporate"],
    profileImage: "/drivers/marcus-johnson/profile.jpg",
  },
  {
    personalInfo: {
      firstName: "Elena",
      lastName: "Rodriguez",
      email: "elena.rodriguez@royalcarriage.com",
      phone: "(312) 555-0102",
      dateOfBirth: new Date("1990-07-22"),
      licenseNumber: "D400-5552-0102",
      licenseState: "IL",
      licenseExpiration: new Date("2027-07-22"),
      ssn: "***-**-2345",
    },
    employment: {
      status: "active",
      hireDate: new Date("2021-03-15"),
      terminationDate: null,
      employmentType: "employee",
    },
    documents: {
      licenseImage: "/drivers/elena-rodriguez/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2021-03-01"),
        expirationDate: new Date("2026-03-01"),
        provider: "Checkr",
      },
      certifications: [
        {
          name: "Defensive Driving",
          issueDate: new Date("2021-04-15"),
          expirationDate: new Date("2026-04-15"),
          documentUrl: "/drivers/elena-rodriguez/certs/defensive-driving.pdf",
        },
      ],
      insuranceCard: "/drivers/elena-rodriguez/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 1523,
      completedRides: 1498,
      cancelledRides: 25,
      averageRating: 4.95,
      totalRatings: 1342,
      acceptanceRate: 98,
      cancellationRate: 1.5,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 25,
      payStructure: "percentage",
      payPercentage: 75,
      deductions: [],
    },
    availability: {
      currentStatus: "online",
      availableVehicleIds: ["lincoln-continental", "bmw-7-series"],
      schedule: [
        { dayOfWeek: 0, startTime: "08:00", endTime: "16:00", isWorking: true },
        { dayOfWeek: 1, startTime: "07:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 2, startTime: "07:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 3, startTime: "07:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 4, startTime: "07:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 5, startTime: "09:00", endTime: "14:00", isWorking: true },
        {
          dayOfWeek: 6,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
      ],
    },
    ratings: {
      totalRatings: 1342,
      averageRating: 4.95,
      byCategory: {
        cleanliness: 4.98,
        professionalism: 4.96,
        safetyDriving: 4.92,
        customerService: 4.94,
      },
    },
    vehicleTypes: ["sedan"],
    specializations: ["corporate", "wedding"],
    profileImage: "/drivers/elena-rodriguez/profile.jpg",
  },
  {
    personalInfo: {
      firstName: "David",
      lastName: "Thompson",
      email: "david.thompson@royalcarriage.com",
      phone: "(312) 555-0103",
      dateOfBirth: new Date("1978-11-08"),
      licenseNumber: "D400-5553-0103",
      licenseState: "IL",
      licenseExpiration: new Date("2026-11-08"),
      ssn: "***-**-3456",
    },
    employment: {
      status: "active",
      hireDate: new Date("2018-01-10"),
      terminationDate: null,
      employmentType: "employee",
    },
    documents: {
      licenseImage: "/drivers/david-thompson/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2023-01-10"),
        expirationDate: new Date("2028-01-10"),
        provider: "Sterling",
      },
      certifications: [
        {
          name: "CDL Class A",
          issueDate: new Date("2015-03-20"),
          expirationDate: new Date("2027-03-20"),
          documentUrl: "/drivers/david-thompson/certs/cdl-a.pdf",
        },
        {
          name: "Passenger Endorsement",
          issueDate: new Date("2015-03-20"),
          expirationDate: new Date("2027-03-20"),
          documentUrl:
            "/drivers/david-thompson/certs/passenger-endorsement.pdf",
        },
      ],
      insuranceCard: "/drivers/david-thompson/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 4521,
      completedRides: 4412,
      cancelledRides: 109,
      averageRating: 4.85,
      totalRatings: 3987,
      acceptanceRate: 94,
      cancellationRate: 2.4,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 30,
      payStructure: "percentage",
      payPercentage: 78,
      deductions: [],
    },
    availability: {
      currentStatus: "on_break",
      availableVehicleIds: [
        "lincoln-stretch",
        "party-bus-36",
        "party-bus-24",
        "motor-coach",
      ],
      schedule: [
        { dayOfWeek: 0, startTime: "10:00", endTime: "22:00", isWorking: true },
        { dayOfWeek: 1, startTime: "14:00", endTime: "23:00", isWorking: true },
        { dayOfWeek: 2, startTime: "14:00", endTime: "23:00", isWorking: true },
        { dayOfWeek: 3, startTime: "14:00", endTime: "23:00", isWorking: true },
        { dayOfWeek: 4, startTime: "14:00", endTime: "23:00", isWorking: true },
        { dayOfWeek: 5, startTime: "12:00", endTime: "24:00", isWorking: true },
        { dayOfWeek: 6, startTime: "12:00", endTime: "24:00", isWorking: true },
      ],
    },
    ratings: {
      totalRatings: 3987,
      averageRating: 4.85,
      byCategory: {
        cleanliness: 4.82,
        professionalism: 4.88,
        safetyDriving: 4.9,
        customerService: 4.8,
      },
    },
    vehicleTypes: ["stretch_limo", "party_bus", "van"],
    specializations: ["partybus", "wedding", "event"],
    profileImage: "/drivers/david-thompson/profile.jpg",
  },
  {
    personalInfo: {
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@royalcarriage.com",
      phone: "(312) 555-0104",
      dateOfBirth: new Date("1988-04-12"),
      licenseNumber: "D400-5554-0104",
      licenseState: "IL",
      licenseExpiration: new Date("2028-04-12"),
      ssn: "***-**-4567",
    },
    employment: {
      status: "active",
      hireDate: new Date("2022-08-01"),
      terminationDate: null,
      employmentType: "employee",
    },
    documents: {
      licenseImage: "/drivers/sarah-chen/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2022-07-15"),
        expirationDate: new Date("2027-07-15"),
        provider: "Checkr",
      },
      certifications: [
        {
          name: "Defensive Driving",
          issueDate: new Date("2022-09-01"),
          expirationDate: new Date("2027-09-01"),
          documentUrl: "/drivers/sarah-chen/certs/defensive-driving.pdf",
        },
      ],
      insuranceCard: "/drivers/sarah-chen/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 892,
      completedRides: 879,
      cancelledRides: 13,
      averageRating: 4.92,
      totalRatings: 756,
      acceptanceRate: 97,
      cancellationRate: 1.5,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 25,
      payStructure: "percentage",
      payPercentage: 72,
      deductions: [],
    },
    availability: {
      currentStatus: "offline",
      availableVehicleIds: [
        "cadillac-escalade-esv",
        "lincoln-navigator",
        "chevrolet-suburban",
      ],
      schedule: [
        { dayOfWeek: 0, startTime: "06:00", endTime: "14:00", isWorking: true },
        { dayOfWeek: 1, startTime: "04:00", endTime: "12:00", isWorking: true },
        { dayOfWeek: 2, startTime: "04:00", endTime: "12:00", isWorking: true },
        { dayOfWeek: 3, startTime: "04:00", endTime: "12:00", isWorking: true },
        { dayOfWeek: 4, startTime: "04:00", endTime: "12:00", isWorking: true },
        { dayOfWeek: 5, startTime: "04:00", endTime: "14:00", isWorking: true },
        {
          dayOfWeek: 6,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
      ],
    },
    ratings: {
      totalRatings: 756,
      averageRating: 4.92,
      byCategory: {
        cleanliness: 4.95,
        professionalism: 4.9,
        safetyDriving: 4.92,
        customerService: 4.91,
      },
    },
    vehicleTypes: ["suv"],
    specializations: ["airport", "corporate"],
    profileImage: "/drivers/sarah-chen/profile.jpg",
  },
  {
    personalInfo: {
      firstName: "Michael",
      lastName: "Williams",
      email: "michael.williams@royalcarriage.com",
      phone: "(312) 555-0105",
      dateOfBirth: new Date("1982-09-25"),
      licenseNumber: "D400-5555-0105",
      licenseState: "IL",
      licenseExpiration: new Date("2027-09-25"),
      ssn: "***-**-5678",
    },
    employment: {
      status: "active",
      hireDate: new Date("2019-04-15"),
      terminationDate: null,
      employmentType: "employee",
    },
    documents: {
      licenseImage: "/drivers/michael-williams/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2024-04-01"),
        expirationDate: new Date("2029-04-01"),
        provider: "Checkr",
      },
      certifications: [
        {
          name: "CDL Class B",
          issueDate: new Date("2018-06-01"),
          expirationDate: new Date("2026-06-01"),
          documentUrl: "/drivers/michael-williams/certs/cdl-b.pdf",
        },
        {
          name: "First Aid",
          issueDate: new Date("2023-01-15"),
          expirationDate: new Date("2025-01-15"),
          documentUrl: "/drivers/michael-williams/certs/first-aid.pdf",
        },
      ],
      insuranceCard: "/drivers/michael-williams/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 3156,
      completedRides: 3089,
      cancelledRides: 67,
      averageRating: 4.88,
      totalRatings: 2743,
      acceptanceRate: 95,
      cancellationRate: 2.1,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 28,
      payStructure: "percentage",
      payPercentage: 76,
      deductions: [],
    },
    availability: {
      currentStatus: "online",
      availableVehicleIds: [
        "mercedes-sprinter-14",
        "mercedes-sprinter-12",
        "gmc-yukon-denali",
      ],
      schedule: [
        { dayOfWeek: 0, startTime: "07:00", endTime: "19:00", isWorking: true },
        { dayOfWeek: 1, startTime: "05:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 2, startTime: "05:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 3, startTime: "05:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 4, startTime: "05:00", endTime: "17:00", isWorking: true },
        { dayOfWeek: 5, startTime: "05:00", endTime: "19:00", isWorking: true },
        { dayOfWeek: 6, startTime: "07:00", endTime: "15:00", isWorking: true },
      ],
    },
    ratings: {
      totalRatings: 2743,
      averageRating: 4.88,
      byCategory: {
        cleanliness: 4.85,
        professionalism: 4.9,
        safetyDriving: 4.92,
        customerService: 4.85,
      },
    },
    vehicleTypes: ["van", "suv"],
    specializations: ["airport", "corporate", "group"],
    profileImage: "/drivers/michael-williams/profile.jpg",
  },
  {
    personalInfo: {
      firstName: "James",
      lastName: "Anderson",
      email: "james.anderson@royalcarriage.com",
      phone: "(312) 555-0106",
      dateOfBirth: new Date("1975-01-30"),
      licenseNumber: "D400-5556-0106",
      licenseState: "IL",
      licenseExpiration: new Date("2027-01-30"),
      ssn: "***-**-6789",
    },
    employment: {
      status: "active",
      hireDate: new Date("2015-09-01"),
      terminationDate: null,
      employmentType: "employee",
    },
    documents: {
      licenseImage: "/drivers/james-anderson/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2023-09-01"),
        expirationDate: new Date("2028-09-01"),
        provider: "Sterling",
      },
      certifications: [
        {
          name: "CDL Class A",
          issueDate: new Date("2010-05-15"),
          expirationDate: new Date("2026-05-15"),
          documentUrl: "/drivers/james-anderson/certs/cdl-a.pdf",
        },
        {
          name: "Chauffeur Certification",
          issueDate: new Date("2015-09-15"),
          expirationDate: new Date("2027-09-15"),
          documentUrl: "/drivers/james-anderson/certs/chauffeur.pdf",
        },
      ],
      insuranceCard: "/drivers/james-anderson/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 6234,
      completedRides: 6102,
      cancelledRides: 132,
      averageRating: 4.93,
      totalRatings: 5421,
      acceptanceRate: 97,
      cancellationRate: 2.1,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 32,
      payStructure: "percentage",
      payPercentage: 80,
      deductions: [],
    },
    availability: {
      currentStatus: "online",
      availableVehicleIds: [
        "lincoln-stretch",
        "cadillac-escalade-esv",
        "lincoln-navigator",
      ],
      schedule: [
        { dayOfWeek: 0, startTime: "10:00", endTime: "20:00", isWorking: true },
        { dayOfWeek: 1, startTime: "08:00", endTime: "20:00", isWorking: true },
        { dayOfWeek: 2, startTime: "08:00", endTime: "20:00", isWorking: true },
        { dayOfWeek: 3, startTime: "08:00", endTime: "20:00", isWorking: true },
        { dayOfWeek: 4, startTime: "08:00", endTime: "20:00", isWorking: true },
        { dayOfWeek: 5, startTime: "10:00", endTime: "22:00", isWorking: true },
        { dayOfWeek: 6, startTime: "10:00", endTime: "22:00", isWorking: true },
      ],
    },
    ratings: {
      totalRatings: 5421,
      averageRating: 4.93,
      byCategory: {
        cleanliness: 4.95,
        professionalism: 4.96,
        safetyDriving: 4.9,
        customerService: 4.91,
      },
    },
    vehicleTypes: ["stretch_limo", "suv"],
    specializations: ["wedding", "vip", "corporate"],
    profileImage: "/drivers/james-anderson/profile.jpg",
  },
  {
    personalInfo: {
      firstName: "Robert",
      lastName: "Martinez",
      email: "robert.martinez@royalcarriage.com",
      phone: "(312) 555-0107",
      dateOfBirth: new Date("1992-06-18"),
      licenseNumber: "D400-5557-0107",
      licenseState: "IL",
      licenseExpiration: new Date("2028-06-18"),
      ssn: "***-**-7890",
    },
    employment: {
      status: "active",
      hireDate: new Date("2023-02-01"),
      terminationDate: null,
      employmentType: "contractor",
    },
    documents: {
      licenseImage: "/drivers/robert-martinez/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2023-01-15"),
        expirationDate: new Date("2028-01-15"),
        provider: "Checkr",
      },
      certifications: [
        {
          name: "Defensive Driving",
          issueDate: new Date("2023-03-01"),
          expirationDate: new Date("2028-03-01"),
          documentUrl: "/drivers/robert-martinez/certs/defensive-driving.pdf",
        },
      ],
      insuranceCard: "/drivers/robert-martinez/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 456,
      completedRides: 448,
      cancelledRides: 8,
      averageRating: 4.87,
      totalRatings: 389,
      acceptanceRate: 94,
      cancellationRate: 1.8,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 22,
      payStructure: "percentage",
      payPercentage: 70,
      deductions: [],
    },
    availability: {
      currentStatus: "offline",
      availableVehicleIds: ["lincoln-continental", "cadillac-xts"],
      schedule: [
        {
          dayOfWeek: 0,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
        { dayOfWeek: 1, startTime: "16:00", endTime: "24:00", isWorking: true },
        { dayOfWeek: 2, startTime: "16:00", endTime: "24:00", isWorking: true },
        { dayOfWeek: 3, startTime: "16:00", endTime: "24:00", isWorking: true },
        { dayOfWeek: 4, startTime: "16:00", endTime: "24:00", isWorking: true },
        { dayOfWeek: 5, startTime: "18:00", endTime: "02:00", isWorking: true },
        { dayOfWeek: 6, startTime: "18:00", endTime: "02:00", isWorking: true },
      ],
    },
    ratings: {
      totalRatings: 389,
      averageRating: 4.87,
      byCategory: {
        cleanliness: 4.85,
        professionalism: 4.88,
        safetyDriving: 4.9,
        customerService: 4.85,
      },
    },
    vehicleTypes: ["sedan"],
    specializations: ["airport", "nightlife"],
    profileImage: "/drivers/robert-martinez/profile.jpg",
  },
  {
    personalInfo: {
      firstName: "Patricia",
      lastName: "Davis",
      email: "patricia.davis@royalcarriage.com",
      phone: "(312) 555-0108",
      dateOfBirth: new Date("1980-12-05"),
      licenseNumber: "D400-5558-0108",
      licenseState: "IL",
      licenseExpiration: new Date("2027-12-05"),
      ssn: "***-**-8901",
    },
    employment: {
      status: "on_leave",
      hireDate: new Date("2017-07-01"),
      terminationDate: null,
      employmentType: "employee",
    },
    documents: {
      licenseImage: "/drivers/patricia-davis/license.jpg",
      backgroundCheck: {
        status: "passed",
        date: new Date("2022-07-01"),
        expirationDate: new Date("2027-07-01"),
        provider: "Checkr",
      },
      certifications: [
        {
          name: "CDL Class B",
          issueDate: new Date("2016-03-15"),
          expirationDate: new Date("2026-03-15"),
          documentUrl: "/drivers/patricia-davis/certs/cdl-b.pdf",
        },
      ],
      insuranceCard: "/drivers/patricia-davis/insurance.jpg",
      insuranceExpiration: new Date("2026-12-31"),
    },
    performance: {
      totalRides: 3892,
      completedRides: 3812,
      cancelledRides: 80,
      averageRating: 4.91,
      totalRatings: 3345,
      acceptanceRate: 96,
      cancellationRate: 2.1,
    },
    pay: {
      paymentMethod: "direct_deposit",
      bankAccount: {
        routingNumber: "***masked***",
        accountNumber: "***masked***",
        accountType: "checking",
      },
      basePay: 28,
      payStructure: "percentage",
      payPercentage: 77,
      deductions: [],
    },
    availability: {
      currentStatus: "offline",
      availableVehicleIds: ["mercedes-sprinter-14", "party-bus-24"],
      schedule: [
        {
          dayOfWeek: 0,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
        {
          dayOfWeek: 1,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
        {
          dayOfWeek: 2,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
        {
          dayOfWeek: 3,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
        {
          dayOfWeek: 4,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
        {
          dayOfWeek: 5,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
        {
          dayOfWeek: 6,
          startTime: "00:00",
          endTime: "00:00",
          isWorking: false,
        },
      ],
    },
    ratings: {
      totalRatings: 3345,
      averageRating: 4.91,
      byCategory: {
        cleanliness: 4.93,
        professionalism: 4.9,
        safetyDriving: 4.88,
        customerService: 4.93,
      },
    },
    vehicleTypes: ["van", "party_bus"],
    specializations: ["partybus", "group", "event"],
    profileImage: "/drivers/patricia-davis/profile.jpg",
  },
];

async function seedDrivers() {
  console.log("Starting driver seeding...");

  const driversRef = db.collection("drivers");
  const now = admin.firestore.Timestamp.now();

  // Check existing drivers
  const existingSnapshot = await driversRef.get();
  console.log(`Found ${existingSnapshot.size} existing drivers`);

  let created = 0;
  let skipped = 0;

  for (const driver of SAMPLE_DRIVERS) {
    const driverId = `${driver.personalInfo.firstName.toLowerCase()}-${driver.personalInfo.lastName.toLowerCase()}`;

    // Check if driver exists
    const existingDoc = await driversRef.doc(driverId).get();
    if (existingDoc.exists) {
      console.log(
        `  Skipping ${driver.personalInfo.firstName} ${driver.personalInfo.lastName} - already exists`,
      );
      skipped++;
      continue;
    }

    // Convert dates to Timestamps
    const driverData = {
      ...driver,
      tenantId: "royal-carriage",
      userId: null, // Will be linked when user account created
      personalInfo: {
        ...driver.personalInfo,
        dateOfBirth: admin.firestore.Timestamp.fromDate(
          driver.personalInfo.dateOfBirth,
        ),
        licenseExpiration: admin.firestore.Timestamp.fromDate(
          driver.personalInfo.licenseExpiration,
        ),
      },
      employment: {
        ...driver.employment,
        hireDate: admin.firestore.Timestamp.fromDate(
          driver.employment.hireDate,
        ),
        terminationDate: driver.employment.terminationDate
          ? admin.firestore.Timestamp.fromDate(
              driver.employment.terminationDate,
            )
          : null,
      },
      documents: {
        ...driver.documents,
        backgroundCheck: {
          ...driver.documents.backgroundCheck,
          date: admin.firestore.Timestamp.fromDate(
            driver.documents.backgroundCheck.date,
          ),
          expirationDate: admin.firestore.Timestamp.fromDate(
            driver.documents.backgroundCheck.expirationDate,
          ),
        },
        certifications: driver.documents.certifications.map((cert) => ({
          ...cert,
          issueDate: admin.firestore.Timestamp.fromDate(cert.issueDate),
          expirationDate: admin.firestore.Timestamp.fromDate(
            cert.expirationDate,
          ),
        })),
        insuranceExpiration: admin.firestore.Timestamp.fromDate(
          driver.documents.insuranceExpiration,
        ),
      },
      created: now,
      updated: now,
    };

    await driversRef.doc(driverId).set(driverData);
    console.log(
      `  Created driver: ${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
    );
    created++;
  }

  console.log(`\nDriver seeding complete!`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total in collection: ${existingSnapshot.size + created}`);

  return { created, skipped, total: existingSnapshot.size + created };
}

// Run the seeding
seedDrivers()
  .then((result) => {
    console.log("\nSeeding completed successfully!");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
