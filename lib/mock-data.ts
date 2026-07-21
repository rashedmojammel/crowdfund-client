// Seed data for the mock API layer. Everything here lives in memory —
// mutations made through lib/mock-api.ts survive navigation but reset on a
// full page reload. Only the logged-in session persists (see lib/store.ts).
//
// Amounts are in CREDITS unless a field is explicitly *_Usd.
// Rates: 10 credits = $1 (buy), 20 credits = $1 (withdraw).

import type {
  AppNotification,
  Campaign,
  Contribution,
  Payment,
  Report,
  User,
  Withdrawal,
} from "@/types";

/** Seed users carry a plaintext password — mock only, never returned by the API. */
export interface MockUser extends User {
  password: string;
}

const cover = (seed: string) => `https://picsum.photos/seed/${seed}/1200/675`;
const avatar = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;

export const mockUsers: MockUser[] = [
  {
    id: "user-supporter-1",
    name: "Samiha Noor",
    email: "supporter@test.com",
    password: "Test@1234",
    role: "supporter",
    // 50 signup bonus + 850 purchased − 700 contributed + 80 refunded = 280
    credits: 280,
    image: avatar("supporter@test.com"),
    signupBonusGranted: true,
    createdAt: "2026-05-18T09:12:00.000Z",
  },
  {
    id: "user-creator-1",
    name: "Farhan Kabir",
    email: "creator@test.com",
    password: "Test@1234",
    role: "creator",
    credits: 20, // signup bonus only — earnings live on campaigns until withdrawn
    image: avatar("creator@test.com"),
    signupBonusGranted: true,
    createdAt: "2026-05-02T14:40:00.000Z",
  },
  {
    id: "user-admin-1",
    name: "Rashed Alam",
    email: "admin@test.com",
    password: "Test@1234",
    role: "admin",
    credits: 0,
    image: avatar("admin@test.com"),
    signupBonusGranted: true,
    createdAt: "2026-04-20T08:00:00.000Z",
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: "camp-1",
    title: "SolarBridge: Portable Solar Kits for Rural Clinics",
    category: "health",
    story:
      "Forty-one rural clinics in the Sylhet division still lose refrigerated vaccines every time the grid fails, which in monsoon season can be three times a week. SolarBridge builds a rugged 400W fold-out solar kit with a battery buffer sized to keep one vaccine fridge and two exam lights running for 18 hours. We have field-tested two prototypes at the Kanaighat upazila health complex since March, and the cold chain has not broken once. This campaign funds the first production run of 25 kits, local technician training, and a two-year maintenance pool.",
    reward:
      "Backers of 100+ credits get a laser-cut clinic dedication tag with their name mounted on one of the kits, plus quarterly field reports with photos.",
    image: cover("fundspark-solarbridge"),
    funding_goal: 60000,
    amount_raised: 51500,
    deadline: "2026-09-30T23:59:59.000Z",
    status: "approved",
    creatorEmail: "creator@test.com",
    creatorName: "Farhan Kabir",
    createdAt: "2026-05-10T10:05:00.000Z",
  },
  {
    id: "camp-2",
    title: "Pages for All: A Mobile Library for Char Communities",
    category: "education",
    story:
      "Children living on the river islands (chars) of the Jamuna change schools every time the river moves, and most have never owned a book. Pages for All converts a flat-bottomed country boat into a floating library with 1,800 titles, solar lighting, and a weekly reading circle led by two trained facilitators. The boat will run a fixed six-stop route between Sirajganj and Gaibandha, reaching around 900 children per month. Funds cover the boat conversion, the first book stock, and facilitator salaries for one full year.",
    reward:
      "Every backer gets a bookplate with their name inside one of the library's books; 500+ credit backers can dedicate a full shelf.",
    image: cover("fundspark-pagesforall"),
    funding_goal: 30000,
    amount_raised: 29200,
    deadline: "2026-08-15T23:59:59.000Z",
    status: "approved",
    creatorEmail: "creator@test.com",
    creatorName: "Farhan Kabir",
    createdAt: "2026-05-22T11:30:00.000Z",
  },
  {
    id: "camp-3",
    title: "Clean Karnaphuli: River Cleanup Flotilla",
    category: "environment",
    story:
      "The Karnaphuli carries an estimated 8 tonnes of plastic past Chattogram every day. Clean Karnaphuli equips a flotilla of six fishing boats — crewed by fishermen who lose income to polluted water — with surface trawl nets and sorting bins, paying fair day rates for three cleanup days per week. Collected plastic goes to a verified recycler in Sagorika, and we publish weigh-station receipts monthly. The goal funds nets, boat retrofits, and six months of crew wages.",
    reward:
      "Backers receive a monthly impact dashboard and a keychain made from recycled river plastic collected by the flotilla.",
    image: cover("fundspark-karnaphuli"),
    funding_goal: 45000,
    amount_raised: 0,
    deadline: "2026-11-30T23:59:59.000Z",
    status: "pending",
    creatorEmail: "creator@test.com",
    creatorName: "Farhan Kabir",
    createdAt: "2026-07-14T16:45:00.000Z",
  },
  {
    id: "camp-4",
    title: "Handloom Revival: Fair Wages for Tangail Weavers",
    category: "creative",
    story:
      "There were 60,000 working handlooms in Tangail a generation ago; fewer than 9,000 remain. Handloom Revival signs year-long contracts with 30 master weavers at 40% above the middleman rate, pre-purchasing their output so families can plan. We sell the saris through a direct online store and split margin transparently: 55% weaver, 30% materials, 15% operations. This raise covers the first six months of guaranteed purchases and a shared dye workshop that removes the weavers' single biggest cost.",
    reward:
      "300+ credit backers receive a handwoven cotton scarf from the first production batch, with the weaver's name on the label.",
    image: cover("fundspark-handloom"),
    funding_goal: 80000,
    amount_raised: 24600,
    deadline: "2026-10-31T23:59:59.000Z",
    status: "approved",
    creatorEmail: "creator@test.com",
    creatorName: "Farhan Kabir",
    createdAt: "2026-06-01T09:20:00.000Z",
  },
  {
    id: "camp-5",
    title: "CodeCamp Chattogram: Free Evening Bootcamp for Garment Workers",
    category: "education",
    story:
      "Garment workers in Chattogram's EPZ finish shifts at 6pm with no affordable path into better-paid work. CodeCamp runs a free 20-week evening bootcamp — HTML, CSS, JavaScript, and a final client project — in a donated floor of the Agrabad IT tower. Our pilot cohort of 18 students placed 11 into junior web roles within three months of graduating. This campaign funds laptops, two instructors, and dinner for the next two cohorts of 30 students each.",
    reward:
      "Backers get invited to the online demo day and receive the cohort's yearbook; 1,000+ credit backers are listed as founding sponsors on the classroom wall.",
    image: cover("fundspark-codecamp"),
    funding_goal: 70000,
    amount_raised: 68900,
    deadline: "2026-08-31T23:59:59.000Z",
    status: "approved",
    creatorEmail: "nadia.rahman@fundspark.dev",
    creatorName: "Nadia Rahman",
    createdAt: "2026-05-05T13:00:00.000Z",
  },
  {
    id: "camp-6",
    title: "StreetPaws: Rabies Vaccination Drive for 2,000 Street Dogs",
    category: "community",
    story:
      "Dhaka North reported over 300 dog-bite rabies scares last year, and the standard response — culling — doesn't work; vaccinated, stable dog populations do. StreetPaws will vaccinate and ear-tag 2,000 street dogs across Mirpur and Uttara in a 10-week drive, run with two licensed vets and a trained catch-release team of eight volunteers. Vaccine cold-chain costs, vet fees, and tagging supplies are all itemized in our public budget sheet.",
    reward:
      "Backers receive photo updates of vaccinated dogs from their chosen neighbourhood and a supporter sticker pack designed by a local artist.",
    image: cover("fundspark-streetpaws"),
    funding_goal: 25000,
    amount_raised: 12750,
    deadline: "2026-09-15T23:59:59.000Z",
    status: "approved",
    creatorEmail: "arif.chowdhury@fundspark.dev",
    creatorName: "Arif Chowdhury",
    createdAt: "2026-06-08T10:10:00.000Z",
  },
  {
    id: "camp-7",
    title: "Rickshaw Runner: A Dhaka-Made Indie Racing Game",
    category: "technology",
    story:
      "Rickshaw Runner is a chaotic arcade racer through a hand-drawn Old Dhaka — dodging buses on Bangshal Road, drafting behind CNGs, and upgrading your rickshaw with absurd parts from a Chawkbazar-inspired shop. The three of us have shipped mobile games before; a free demo with the first two tracks is already live on itch.io with a 4.6 rating from 700 players. Funding covers 10 more tracks, original soundtrack by a Dhaka folk-fusion band, and Steam release costs.",
    reward:
      "All backers get the game at launch with their name in the credits; 400+ credit backers get the soundtrack and a playable golden rickshaw skin.",
    image: cover("fundspark-rickshawrunner"),
    funding_goal: 50000,
    amount_raised: 41000,
    deadline: "2026-12-20T23:59:59.000Z",
    status: "approved",
    creatorEmail: "tania.akter@fundspark.dev",
    creatorName: "Tania Akter",
    createdAt: "2026-06-12T18:25:00.000Z",
  },
  {
    id: "camp-8",
    title: "Mangrove Guardians: Replanting the Sundarbans Buffer Zone",
    category: "environment",
    story:
      "Cyclone Remal stripped 340 hectares of mangrove from the Sundarbans buffer villages of Shyamnagar. Mangrove Guardians pays village women's cooperatives to grow, plant, and monitor 150,000 keora and baen saplings across the most exposed embankments, with survival tracked by GPS-tagged plots audited every quarter. The cooperative model has already achieved 71% sapling survival in our 2025 pilot — well above the 40% average for contractor-led planting.",
    reward:
      "Backers can name a plot on the public survival map; every backer receives the quarterly drone-survey report of the replanted embankments.",
    image: cover("fundspark-mangrove"),
    funding_goal: 100000,
    amount_raised: 90500,
    deadline: "2026-11-15T23:59:59.000Z",
    status: "approved",
    creatorEmail: "arif.chowdhury@fundspark.dev",
    creatorName: "Arif Chowdhury",
    createdAt: "2026-05-28T07:55:00.000Z",
  },
  {
    id: "camp-9",
    title: "Open Prosthetics Lab Dhaka: 3D-Printed Limbs at 1/10th the Cost",
    category: "health",
    story:
      "A basic below-elbow prosthetic costs a Bangladeshi family around $900 imported; our 3D-printed open-source design costs $85 in materials and is fitted in two visits. Open Prosthetics Lab will be a permanent workshop at Mohammadpur with three printers, a certified prosthetist, and a free fitting program targeting 120 patients in year one, prioritizing garment-machine injury cases. All designs are published openly so any clinic can replicate the lab.",
    reward:
      "Backers receive the lab's open build guide and a video diary of the first ten fittings; 2,000+ credit backers fund and name a complete patient fitting.",
    image: cover("fundspark-prosthetics"),
    funding_goal: 120000,
    amount_raised: 15300,
    deadline: "2026-12-31T23:59:59.000Z",
    status: "approved",
    creatorEmail: "nadia.rahman@fundspark.dev",
    creatorName: "Nadia Rahman",
    createdAt: "2026-06-20T12:35:00.000Z",
  },
  {
    id: "camp-10",
    title: "Rooftop Greens: 100 Urban Vegetable Gardens for Dhaka Schools",
    category: "community",
    story:
      "Dhaka has more than 4,000 flat school rooftops baking empty in the sun. Rooftop Greens installs low-cost drip-irrigated garden beds on 100 of them, each producing roughly 40kg of vegetables per month for the school's midday meal program while doubling as a hands-on science space. Each installation costs 350 credits including soil, seeds, drip lines, and a teacher training day, and schools commit to a two-year maintenance plan before we build.",
    reward:
      "Backers are matched to a school and receive its harvest log each season; 350+ credit backers fund a full named garden bed.",
    image: cover("fundspark-rooftopgreens"),
    funding_goal: 35000,
    amount_raised: 0,
    deadline: "2026-10-01T23:59:59.000Z",
    status: "pending",
    creatorEmail: "tania.akter@fundspark.dev",
    creatorName: "Tania Akter",
    createdAt: "2026-07-16T09:05:00.000Z",
  },
  {
    id: "camp-11",
    title: "Mothers' Craft Collective: An Online Store for Home Artisans",
    category: "creative",
    story:
      "Two hundred home-based artisans — mostly mothers who cannot take outside work — sell jute baskets, nakshi kantha, and clay homeware through middlemen who take up to 70% of the sale price. The Collective wants to build a shared online storefront with photography, packing, and delivery handled centrally so artisans keep 80%. The raise covers the storefront build, a small packing hub in Savar, and product photography for the first 500 listings.",
    reward:
      "Backers get early access to the store launch sale and a handmade jute coaster set from the first packed order.",
    image: cover("fundspark-craftcollective"),
    funding_goal: 40000,
    amount_raised: 0,
    deadline: "2026-09-30T23:59:59.000Z",
    status: "rejected",
    creatorEmail: "sabbir.hossain@fundspark.dev",
    creatorName: "Sabbir Hossain",
    createdAt: "2026-06-25T15:50:00.000Z",
  },
  {
    id: "camp-12",
    title: "Instant Scholarship Raffle: Win a Full University Scholarship",
    category: "education",
    story:
      "Contribute today and enter our weekly raffle for a chance to win a full four-year university scholarship worth $12,000. The more credits you contribute, the more raffle entries you receive, and every contributor is guaranteed at least one prize from our sponsor pool. Winners are announced every Friday night on our Facebook page. Scholarships are transferable and can be exchanged for their cash value at any time.",
    reward:
      "One raffle entry per 10 credits contributed. Guaranteed prize for every participant. Grand prize drawn weekly.",
    image: cover("fundspark-raffle"),
    funding_goal: 200000,
    amount_raised: 8200,
    deadline: "2026-08-01T23:59:59.000Z",
    status: "suspended",
    creatorEmail: "sabbir.hossain@fundspark.dev",
    creatorName: "Sabbir Hossain",
    createdAt: "2026-07-01T20:15:00.000Z",
  },
];

export const mockContributions: Contribution[] = [
  {
    id: "contrib-1",
    campaignId: "camp-5",
    campaignTitle: "CodeCamp Chattogram: Free Evening Bootcamp for Garment Workers",
    supporterEmail: "supporter@test.com",
    supporterName: "Samiha Noor",
    amount: 150,
    status: "approved",
    createdAt: "2026-06-15T10:22:00.000Z",
  },
  {
    id: "contrib-2",
    campaignId: "camp-1",
    campaignTitle: "SolarBridge: Portable Solar Kits for Rural Clinics",
    supporterEmail: "supporter@test.com",
    supporterName: "Samiha Noor",
    amount: 200,
    status: "approved",
    createdAt: "2026-06-21T17:40:00.000Z",
  },
  {
    id: "contrib-3",
    campaignId: "camp-8",
    campaignTitle: "Mangrove Guardians: Replanting the Sundarbans Buffer Zone",
    supporterEmail: "supporter@test.com",
    supporterName: "Samiha Noor",
    amount: 100,
    status: "approved",
    createdAt: "2026-06-28T08:15:00.000Z",
  },
  {
    id: "contrib-4",
    campaignId: "camp-2",
    campaignTitle: "Pages for All: A Mobile Library for Char Communities",
    supporterEmail: "supporter@test.com",
    supporterName: "Samiha Noor",
    amount: 120,
    status: "pending",
    createdAt: "2026-07-17T19:05:00.000Z",
  },
  {
    id: "contrib-5",
    campaignId: "camp-7",
    campaignTitle: "Rickshaw Runner: A Dhaka-Made Indie Racing Game",
    supporterEmail: "supporter@test.com",
    supporterName: "Samiha Noor",
    amount: 80,
    status: "rejected", // refunded — creator paused new backer perks that week
    createdAt: "2026-07-03T21:30:00.000Z",
  },
  {
    id: "contrib-6",
    campaignId: "camp-6",
    campaignTitle: "StreetPaws: Rabies Vaccination Drive for 2,000 Street Dogs",
    supporterEmail: "supporter@test.com",
    supporterName: "Samiha Noor",
    amount: 50,
    status: "approved",
    createdAt: "2026-07-10T12:48:00.000Z",
  },
  {
    id: "contrib-7",
    campaignId: "camp-2",
    campaignTitle: "Pages for All: A Mobile Library for Char Communities",
    supporterEmail: "mehnaz.karim@fundspark.dev",
    supporterName: "Mehnaz Karim",
    amount: 300,
    status: "pending",
    createdAt: "2026-07-19T09:55:00.000Z",
  },
  {
    id: "contrib-8",
    campaignId: "camp-1",
    campaignTitle: "SolarBridge: Portable Solar Kits for Rural Clinics",
    supporterEmail: "rafiq.islam@fundspark.dev",
    supporterName: "Rafiq Islam",
    amount: 500,
    status: "approved",
    createdAt: "2026-07-08T14:20:00.000Z",
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    toEmail: "supporter@test.com",
    message:
      "Your 150-credit contribution to CodeCamp Chattogram was approved by the creator.",
    actionRoute: "/dashboard/my-contributions",
    read: true,
    createdAt: "2026-06-16T09:00:00.000Z",
  },
  {
    id: "notif-2",
    toEmail: "supporter@test.com",
    message:
      "Your 80-credit contribution to Rickshaw Runner was rejected and the credits were refunded to your wallet.",
    actionRoute: "/dashboard/my-contributions",
    read: false,
    createdAt: "2026-07-04T11:12:00.000Z",
  },
  {
    id: "notif-3",
    toEmail: "creator@test.com",
    message:
      "Mehnaz Karim contributed 300 credits to Pages for All — review it in your dashboard.",
    actionRoute: "/dashboard",
    read: false,
    createdAt: "2026-07-19T09:55:30.000Z",
  },
  {
    id: "notif-4",
    toEmail: "creator@test.com",
    message: "Your withdrawal of 600 credits ($30.00) has been marked paid.",
    actionRoute: "/dashboard/withdrawals",
    read: true,
    createdAt: "2026-06-27T16:30:00.000Z",
  },
  {
    id: "notif-5",
    toEmail: "admin@test.com",
    message:
      "A new report was filed against Instant Scholarship Raffle: guaranteed-return claims.",
    actionRoute: "/dashboard/reports",
    read: false,
    createdAt: "2026-07-12T22:05:00.000Z",
  },
];

export const mockWithdrawals: Withdrawal[] = [
  {
    id: "wd-1",
    creatorEmail: "creator@test.com",
    creatorName: "Farhan Kabir",
    credits: 600,
    amountUsd: 30, // 20 credits = $1
    paymentSystem: "bKash",
    accountNumber: "01712-XXXX45",
    status: "paid",
    createdAt: "2026-06-25T13:10:00.000Z",
  },
  {
    id: "wd-2",
    creatorEmail: "creator@test.com",
    creatorName: "Farhan Kabir",
    credits: 400,
    amountUsd: 20,
    paymentSystem: "Bank Transfer",
    accountNumber: "BRAC-104-773-XXXX",
    status: "pending",
    createdAt: "2026-07-18T10:45:00.000Z",
  },
  {
    id: "wd-3",
    creatorEmail: "nadia.rahman@fundspark.dev",
    creatorName: "Nadia Rahman",
    credits: 1000,
    amountUsd: 50,
    paymentSystem: "Nagad",
    accountNumber: "01898-XXXX12",
    status: "pending",
    createdAt: "2026-07-15T18:20:00.000Z",
  },
];

export const mockReports: Report[] = [
  {
    id: "report-1",
    campaignId: "camp-12",
    campaignTitle: "Instant Scholarship Raffle: Win a Full University Scholarship",
    reporterEmail: "supporter@test.com",
    reason: "Misleading financial claims",
    details:
      "The campaign promises guaranteed prizes and cash-convertible scholarships, which reads like a lottery scheme rather than a crowdfunding project. No university partner is named anywhere.",
    status: "open",
    createdAt: "2026-07-12T22:04:00.000Z",
  },
  {
    id: "report-2",
    campaignId: "camp-12",
    campaignTitle: "Instant Scholarship Raffle: Win a Full University Scholarship",
    reporterEmail: "mehnaz.karim@fundspark.dev",
    reason: "Suspected scam",
    details:
      "The Facebook page linked for winner announcements was created two weeks ago and reuses photos from an unrelated coaching centre. Asked for details in the comments and was blocked.",
    status: "open",
    createdAt: "2026-07-14T08:30:00.000Z",
  },
  {
    id: "report-3",
    campaignId: "camp-7",
    campaignTitle: "Rickshaw Runner: A Dhaka-Made Indie Racing Game",
    reporterEmail: "rafiq.islam@fundspark.dev",
    reason: "Copyright concern",
    details:
      "Some of the campaign artwork looks similar to promotional art from another racing game. May be placeholder art, but worth checking before it hits the front page.",
    status: "dismissed", // reviewed — art was original, produced by the team's own illustrator
    createdAt: "2026-06-30T19:45:00.000Z",
  },
  {
    id: "report-4",
    campaignId: "camp-6",
    campaignTitle: "StreetPaws: Rabies Vaccination Drive for 2,000 Street Dogs",
    reporterEmail: "rafiq.islam@fundspark.dev",
    reason: "Duplicate campaign",
    details:
      "A nearly identical vaccination drive campaign appeared on another platform under a different organization name. Creator responded with vet registration documents proving this is the original.",
    status: "resolved",
    createdAt: "2026-06-18T11:25:00.000Z",
  },
];

export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    supporterEmail: "supporter@test.com",
    credits: 100,
    amountUsd: 10, // 10 credits = $1
    sessionId: "cs_mock_a1b2c3d4e5",
    createdAt: "2026-05-20T15:35:00.000Z",
  },
  {
    id: "pay-2",
    supporterEmail: "supporter@test.com",
    credits: 500,
    amountUsd: 50,
    sessionId: "cs_mock_f6g7h8i9j0",
    createdAt: "2026-06-10T09:50:00.000Z",
  },
  {
    id: "pay-3",
    supporterEmail: "supporter@test.com",
    credits: 250,
    amountUsd: 25,
    sessionId: "cs_mock_k1l2m3n4o5",
    createdAt: "2026-07-02T20:10:00.000Z",
  },
];
