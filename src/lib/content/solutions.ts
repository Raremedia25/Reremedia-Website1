// Static "Solutions for Every Business" content.

export const SOLUTIONS = [
  {
    id: "businesses",
    icon: "building",
    title: "Businesses",
    summary: "Run sales, stock and customers from one place.",
    items: ["POS", "Stock", "CRM", "Accounting", "Reports", "Automation"],
    requestType: "Management System",
  },
  {
    id: "hospitality",
    icon: "booking",
    title: "Hotels & Hospitality",
    summary: "Reservations and operations for hotels, lodges and restaurants.",
    items: ["Reservations", "Rooms", "Customers", "Payments", "Reports", "Management"],
    requestType: "Booking Platform",
  },
  {
    id: "cooperatives",
    icon: "social",
    title: "Cooperatives & Groups",
    summary: "Transparent member records, savings and loans.",
    items: ["Members", "Contributions", "Loans", "Repayments", "Meetings", "Reports"],
    requestType: "Management System",
  },
  {
    id: "schools",
    icon: "education",
    title: "Schools",
    summary: "Administration that keeps students, staff and parents informed.",
    items: ["Students", "Teachers", "Attendance", "Fees", "Results", "Administration"],
    requestType: "Management System",
  },
  {
    id: "agriculture",
    icon: "agriculture",
    title: "Agriculture",
    summary: "Digital tools for farmers, cooperatives and agri-businesses.",
    items: ["Farmers", "Farms", "Production", "Harvests", "Marketplaces"],
    requestType: "Custom Software",
  },
  {
    id: "organizations",
    icon: "dashboard",
    title: "Organizations",
    summary: "Structure for NGOs, associations and institutions.",
    items: ["Members", "Projects", "Documents", "Reporting", "Administration"],
    requestType: "Management System",
  },
  {
    id: "startups",
    icon: "sparkles",
    title: "Startups",
    summary: "Ship your product fast with a partner who understands scale.",
    items: ["MVPs", "Websites", "Mobile apps", "SaaS platforms", "APIs"],
    requestType: "Custom Software",
  },
] as const;

export const VALUES = [
  { title: "Custom development", text: "Every system is designed around how your business actually works, not the other way round." },
  { title: "Modern technology", text: "Current frameworks, secure APIs and cloud-ready architecture." },
  { title: "Business-focused", text: "We measure success by the problems we remove from your daily operations." },
  { title: "Scalable architecture", text: "Start small and grow to multiple branches, tenants and countries." },
  { title: "Responsive design", text: "Phones, tablets and desktops all get a first-class experience." },
  { title: "Security", text: "Role-based access, validated inputs, audit logs and protected data." },
  { title: "Performance", text: "Fast loading, optimised images, efficient queries and offline options." },
  { title: "Long-term support", text: "We stay with you after launch with updates, fixes and improvements." },
] as const;

export const PROCESS = [
  { step: "01", title: "Discover", text: "We listen to your goals, study your current process and define the scope together." },
  { step: "02", title: "Design", text: "Wireframes and a clear data model so you see the product before it is built." },
  { step: "03", title: "Build", text: "Iterative development with regular previews, testing and your feedback." },
  { step: "04", title: "Launch & support", text: "Deployment, training and long-term maintenance as your business grows." },
] as const;
