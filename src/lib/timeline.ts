export type TimelineItem = {
  when: string;
  title: string;
  body: string;
  phase: 1 | 2 | 3 | 4;
};

export const TIMELINE: TimelineItem[] = [
  {
    when: "September – November 2026",
    title: "Join the Interest List",
    body: "Share your contact information, expected number of adults and children, lodging needs, and T-shirt sizes. No payment is required during this stage.",
    phase: 1,
  },
  {
    when: "December 2026 – January 2027",
    title: "Registration Opens — $25 Deposit",
    body: "Complete your household registration and pay a $25 deposit to reserve your family's place. The deposit will be applied to your total registration cost.",
    phase: 2,
  },
  {
    when: "By March 31, 2027",
    title: "50% Payment Due",
    body: "At least 50% of your household's total registration cost must be paid by this date.",
    phase: 2,
  },
  {
    when: "By June 30, 2027",
    title: "Final Balance Due",
    body: "All remaining balances must be paid in full. This deadline allows us to finalize food, activities, T-shirts, transportation, and other reunion arrangements.",
    phase: 2,
  },
  {
    when: "July 1 – 31, 2027",
    title: "Late Registration, If Available",
    body: "Late registrations will require full payment at the time of registration. Availability and requested T-shirt sizes cannot be guaranteed.",
    phase: 4,
  },
  {
    when: "September 3 – 5, 2027",
    title: "Russell–Sharp Family Reunion Weekend",
    body: "Atlanta, Georgia — Same Roots, New Vibes!",
    phase: 4,
  },
];

export const REGISTRATION_RATES = [
  { group: "Ages 75 and older", fee: "$95" },
  { group: "Ages 18–74", fee: "$195" },
  { group: "Ages 12–17", fee: "$30" },
  { group: "Ages 5–11", fee: "$20" },
  { group: "Under age 5", fee: "$5" },
];
