// Initial content for the Raremedia platform. Everything here can be edited
// or deleted from the admin dashboard afterwards.

export const PROJECT_CATEGORIES = [
  { name: "Business Management", slug: "business-management", description: "Management systems for SMEs, cooperatives, institutions and organizations." },
  { name: "POS & Inventory", slug: "pos-inventory", description: "Point-of-sale, stock and sales management systems." },
  { name: "Booking", slug: "booking", description: "Reservation and booking platforms." },
  { name: "Agriculture", slug: "agriculture", description: "Farmer, farm and agri-marketplace technology." },
  { name: "Social Platforms", slug: "social-platforms", description: "Social, community and creator platforms." },
  { name: "AI", slug: "ai", description: "AI-powered applications and automation." },
  { name: "Websites", slug: "websites", description: "Business, corporate, portfolio and e-commerce websites." },
  { name: "Education", slug: "education", description: "Learning, exam and school platforms." },
  { name: "Documents", slug: "documents", description: "Document handling and e-signature tools." },
  { name: "Custom Software", slug: "custom-software", description: "Fully custom systems built around a client's idea." },
];

export const POST_CATEGORIES = [
  { name: "Company Updates", slug: "company-updates" },
  { name: "Product Launches", slug: "product-launches" },
  { name: "Technology", slug: "technology" },
  { name: "Case Studies", slug: "case-studies" },
  { name: "Tutorials", slug: "tutorials" },
];

export const SERVICES = [
  {
    name: "Website Development",
    slug: "website-development",
    icon: "globe",
    summary: "Fast, modern and SEO-friendly websites that give your organization a professional online presence.",
    items: ["Business websites", "Corporate websites", "Portfolio websites", "E-commerce websites", "Organization / NGO websites", "Booking websites", "Custom web applications"],
  },
  {
    name: "Business Management Systems",
    slug: "business-management-systems",
    icon: "dashboard",
    summary: "Replace spreadsheets and paper with one reliable system for your whole organization.",
    items: ["SME management systems", "Cooperative management systems", "School management systems", "HR management", "Payroll management", "Asset management", "Customer management", "Multi-branch systems", "Multi-tenant SaaS systems"],
  },
  {
    name: "Sales & Inventory",
    slug: "sales-inventory",
    icon: "pos",
    summary: "POS and stock systems that work at the counter, online and offline.",
    items: ["POS systems", "Bar POS", "Restaurant POS", "Electronics shop systems", "Stock management", "Sales management", "Customer management", "Offline + online systems"],
  },
  {
    name: "Booking & Reservation",
    slug: "booking-reservation",
    icon: "booking",
    summary: "Let customers find, book and pay while you manage availability from one dashboard.",
    items: ["Apartment booking", "Hotel booking", "Lodge booking", "Restaurant reservation", "Appointment booking", "Event booking", "Property management"],
  },
  {
    name: "AI & Automation",
    slug: "ai-automation",
    icon: "ai",
    summary: "Intelligent assistants, content systems and workflows that save hours every day.",
    items: ["AI-powered applications", "AI assistants", "AI content systems", "AI automation", "AI integrations", "Intelligent business workflows"],
  },
  {
    name: "Social & Community Platforms",
    slug: "social-community-platforms",
    icon: "social",
    summary: "Platforms where people connect, create, learn and collaborate.",
    items: ["Social media platforms", "Community platforms", "Messaging systems", "Collaboration platforms", "Creator platforms", "Learning platforms", "Challenge platforms"],
  },
  {
    name: "Agriculture Technology",
    slug: "agriculture-technology",
    icon: "agriculture",
    summary: "Digital tools for farmers, cooperatives and agri-businesses from field to market.",
    items: ["Farmer management", "Farm management", "Production tracking", "Harvest management", "Agriculture marketplace", "Cooperative platforms", "Agricultural traceability"],
  },
  {
    name: "Custom Software",
    slug: "custom-software",
    icon: "code",
    summary: "Have an idea that does not fit a template? We design and build a system around your exact requirements.",
    items: ["Requirement analysis", "System design", "Web, mobile and desktop development", "API development", "Integrations", "Training and long-term support"],
  },
];

export interface SeedProject {
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  features: string[];
  technologies: string[];
  projectStatus: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "RESEARCH";
  clientType?: string;
  isFeatured?: boolean;
  order: number;
  /** Existing screenshot in legacy/src/assets/projects (real product image). */
  screenshot?: string;
  /** Colours for the generated placeholder cover (demo image). */
  accent: [string, string];
  caption?: string;
}

export const PROJECTS: SeedProject[] = [
  {
    title: "Ikimina Management System",
    slug: "ikimina-management-system",
    category: "business-management",
    summary: "A comprehensive cooperative and savings-group platform for members, contributions, loans, repayments, meetings, reports and receipts, with multi-organization data isolation.",
    content: `## Overview

The Ikimina Management System digitises the daily work of savings groups, cooperatives and SACCO-style organizations. Every member, contribution, loan and repayment is recorded with a full audit trail, and reports can be generated as PDF at any time.

## Who it is for

Savings groups (ikimina), cooperatives, associations and any organization that collects contributions and issues loans to members.

## Highlights

- **Members** – registration, profiles, statuses and history
- **Contributions** – scheduled and ad-hoc contributions with receipts
- **Loans & repayments** – applications, approvals, schedules and penalties
- **Meetings** – attendance and minutes
- **Reports** – financial summaries and member statements exported as PDF
- **Security** – user roles and permissions, authentication and audit logs
- **Multi-organization** – each organization's data is fully isolated
- **Offline/online** – keeps working with unreliable connectivity where applicable`,
    features: ["Members", "Contributions", "Loans", "Repayments", "Meetings", "Transactions", "Reports", "Receipts", "Users and permissions", "Authentication", "Audit logs", "PDF reports", "Multi-organization data isolation", "Offline/online capabilities"],
    technologies: ["Java", "Spring Boot"],
    projectStatus: "COMPLETED",
    clientType: "Cooperatives & savings groups",
    isFeatured: true,
    order: 1,
    screenshot: "ikimina.png",
    accent: ["#7c3aed", "#ec4899"],
    caption: "Ikimina Management System – product cover",
  },
  {
    title: "Wisdom T Shop Ltd Management System",
    slug: "wisdom-t-shop-management-system",
    category: "pos-inventory",
    summary: "Electronics sales and stock management system with product and stock control, sales, customer history, top-customer tracking, reports and offline/online operation.",
    content: `## Overview

Built for an electronics shop, this system keeps products, stock levels, sales and customers in sync, and gives the owner a business dashboard with the numbers that matter.

## Highlights

- Product catalogue with categories and pricing
- Stock management with low-stock visibility
- Sales recording and receipts
- Customer profiles with purchase history
- Top-customer tracking
- Reports for sales, stock and customers
- Works offline and syncs when online`,
    features: ["Product management", "Stock management", "Sales", "Customers", "Customer history", "Top customer tracking", "Reports", "Offline/online operation", "Business dashboard"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Electronics shop",
    isFeatured: true,
    order: 2,
    accent: ["#0891b2", "#22d3ee"],
  },
  {
    title: "Bar POS System",
    slug: "bar-pos-system",
    category: "pos-inventory",
    summary: "Professional point-of-sale for bars and similar businesses: products, orders, tables, sales, stock, customers, employees, reports and a live dashboard, online or offline.",
    content: `## Overview

A fast, touch-friendly POS designed for bars, lounges and similar venues. Staff open orders per table, add products, split and settle bills, while stock levels update automatically.

## Highlights

- Products and categories
- Orders and tables
- Sales and receipts
- Stock tracking
- Customers and employees
- Daily and periodic reports
- Dashboard with today's sales, open orders and low stock
- Offline/online operation

Tax features are only added when a client specifically requires them.`,
    features: ["Products", "Orders", "Tables", "Sales", "Stock", "Customers", "Employees", "Reports", "Dashboard", "Offline/online operation"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Bars & hospitality",
    isFeatured: true,
    order: 3,
    screenshot: "hotel-bar.png",
    accent: ["#d97706", "#fbbf24"],
    caption: "Dashboard of the hotel & bar management system",
  },
  {
    title: "Apartment Booking Platform",
    slug: "apartment-booking-platform",
    category: "booking",
    summary: "A platform for discovering and booking apartments with listings, images, search, filters, location, availability, customer accounts and an owner/admin booking dashboard.",
    content: `## Overview

Guests browse apartments with photos, filter by location, price and dates, and book online. Owners and administrators manage listings, availability and bookings from a dashboard.

## Highlights

- Apartment listings with image galleries
- Search and filters (location, price, capacity)
- Availability calendar
- Online booking with customer accounts
- Owner / admin management
- Booking dashboard and notifications`,
    features: ["Apartment listings", "Images", "Search", "Filters", "Location", "Availability", "Booking", "Customer accounts", "Owner/admin management", "Booking dashboard"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Property owners",
    order: 4,
    accent: ["#0f766e", "#2dd4bf"],
  },
  {
    title: "Next Level Digital Platform",
    slug: "next-level-digital-platform",
    category: "websites",
    summary: "A digital and creative services platform covering YouTube growth, promotion, film, photography, video editing, music production, teaching and software development.",
    content: `## Overview

Next Level Digital brings creative and digital services together in one platform where clients can discover services and get in touch.

## Services offered through the platform

- YouTube channel creation and monetization support
- Promotion and AdSense-related support
- YouTube challenge support
- Film production and directing
- Photography and video editing
- Music production, beat making and instrument-related services
- Teaching
- Software development`,
    features: ["YouTube channel creation", "YouTube monetization support", "Promotion", "AdSense-related support", "YouTube challenge support", "Film production", "Film directing", "Photography", "Video editing", "Music production", "Beat making", "Instrument-related services", "Teaching", "Software development"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Creative agency",
    order: 5,
    accent: ["#c026d3", "#f472b6"],
  },
  {
    title: "Rwanda Provisional Driving Permit Exam Platform",
    slug: "rwanda-provisional-driving-permit-exam-platform",
    category: "education",
    summary: "Practice and exam platform for the Rwandan provisional driving permit: road laws, road signs, randomized 20-question tests with a 20-minute timer and a 12/20 pass mark.",
    content: `## Overview

Learners prepare for the Rwanda provisional driving permit with realistic practice exams based on Rwandan road laws and road signs.

## How an exam works

1. 20 randomized questions are drawn from the question bank
2. The learner has 20 minutes to answer
3. Results are shown immediately with the 12/20 pass mark
4. Scores are saved to a history so progress is visible

## Highlights

- Rwanda road laws and road signs
- Randomized questions per attempt
- Timed exams
- Results and score history
- Fully responsive interface for phones`,
    features: ["Rwanda road laws", "Road signs", "Randomized questions", "20 questions per attempt", "20-minute exam", "12/20 pass mark", "Results", "Score history", "Responsive interface"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Learners & driving schools",
    isFeatured: true,
    order: 6,
    accent: ["#2563eb", "#22d3ee"],
  },
  {
    title: "AI House Design Generator",
    slug: "ai-house-design-generator",
    category: "ai",
    summary: "Users enter land size, house size, rooms, floors, parking, compound and other preferences, and the system generates realistic house design concepts.",
    content: `## Overview

An AI-assisted tool that turns a short list of requirements into realistic house design concepts, helping clients visualise options before talking to an architect or builder.

## Inputs

- Land size and house size
- Number of rooms and floors
- Parking requirements
- Compound / fence requirements
- Other preferences

## Output

Realistic design concepts generated from the inputs, ready to refine and share.`,
    features: ["Land size input", "House size input", "Number of rooms", "Floors", "Parking requirements", "Compound/fence requirements", "Preference capture", "Realistic design concept generation"],
    technologies: ["AI APIs"],
    projectStatus: "IN_PROGRESS",
    clientType: "Home owners & builders",
    order: 7,
    accent: ["#7c3aed", "#22d3ee"],
  },
  {
    title: "Document Signing Platform",
    slug: "document-signing-platform",
    category: "documents",
    summary: "Upload documents, add and position signatures, preview, download the signed result and manage documents in one place.",
    content: `## Overview

A simple, secure way to sign documents online: upload a file, draw or place a signature exactly where it belongs, preview the result and download the signed document.

## Highlights

- Document upload
- Signature creation and positioning
- Document preview
- Download of signed documents
- Document management`,
    features: ["Upload documents", "Add signatures", "Position signatures", "Preview documents", "Download signed documents", "Document management"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Businesses & professionals",
    order: 8,
    accent: ["#334155", "#64748b"],
  },
  {
    title: "Prompt-to-Animated-Tutorial Platform",
    slug: "prompt-to-animated-tutorial-platform",
    category: "ai",
    summary: "Users provide a prompt, photos, voice and text; the system generates step-by-step animated instructional content with movement, narration, music and scene sequencing.",
    content: `## Overview

Turn a prompt and a few assets into an animated, narrated tutorial. The platform sequences scenes, animates instructions and adds narration and music where appropriate.

## Inputs

- Prompt
- Photos
- Voice / audio
- Text

## Generated output

- Visual movement and animated instructions
- Narration / audio and music where appropriate
- Scene sequencing for step-by-step learning`,
    features: ["Prompt input", "Photo input", "Voice/audio input", "Text input", "Visual movement", "Narration/audio", "Music", "Animated instructions", "Scene sequencing"],
    technologies: ["AI APIs"],
    projectStatus: "IN_PROGRESS",
    clientType: "Educators & creators",
    order: 9,
    accent: ["#db2777", "#f59e0b"],
  },
  {
    title: "Social Media Platform",
    slug: "social-media-platform",
    category: "social-platforms",
    summary: "An ambitious next-generation social platform combining posts, photos, videos, creator tools, AI assistance, communities, projects, collaboration, learning, challenges and messaging.",
    content: `## Overview

An R&D platform exploring what a social network built for creators, learners and collaborators could look like. It is presented here as an upcoming platform that is not yet publicly launched.

## Planned capabilities

- Posts, photos and videos
- Creator tools and professional editing
- AI assistance
- Communities, projects and collaboration
- Learning, ideas and challenges
- Messaging and search
- Multilingual support
- Creator analytics and future monetization`,
    features: ["Posts", "Photos", "Videos", "Creator tools", "Professional editing", "AI assistance", "Communities", "Projects", "Collaboration", "Learning", "Ideas", "Challenges", "Messaging", "Search", "Multilingual support", "Creator analytics", "Future monetization"],
    technologies: [],
    projectStatus: "RESEARCH",
    clientType: "R&D / upcoming platform",
    order: 10,
    accent: ["#4f46e5", "#ec4899"],
  },
  {
    title: "School Management System",
    slug: "school-management-system",
    category: "education",
    summary: "Student registration, academics, marks, discipline and reporting in one platform designed for schools of any size.",
    content: `## Overview

A school administration platform covering the full student lifecycle: registration, classes, marks, discipline records and reports for teachers, administrators and parents.`,
    features: ["Student registration", "Classes and academics", "Marks and results", "Discipline records", "Reporting"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Schools",
    order: 11,
    screenshot: "school.png",
    accent: ["#7c3aed", "#a78bfa"],
  },
  {
    title: "Audit Management System",
    slug: "audit-management-system",
    category: "business-management",
    summary: "Plan audits, track findings and recommendations, and generate professional audit reports with full traceability.",
    content: `## Overview

Audit teams plan engagements, record findings and recommendations, follow up on actions and produce professional reports with a complete trail of who changed what and when.`,
    features: ["Audit planning", "Findings tracking", "Recommendations", "Follow-up actions", "Professional reports", "Traceability"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Organizations & institutions",
    order: 12,
    screenshot: "audit.png",
    accent: ["#0f766e", "#2dd4bf"],
  },
  {
    title: "E-commerce Platform",
    slug: "e-commerce-platform",
    category: "websites",
    summary: "A modern online store with product catalog, cart, orders and payment-ready checkout, built for growing businesses.",
    content: `## Overview

An online store with a clean catalogue, cart and checkout flow, plus an administration area for products, orders and customers.`,
    features: ["Product catalog", "Cart", "Orders", "Payment-ready checkout", "Admin area"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "Retail businesses",
    order: 13,
    screenshot: "ecommerce.png",
    accent: ["#c026d3", "#f472b6"],
  },
  {
    title: "Financial Management System",
    slug: "financial-management-system",
    category: "business-management",
    summary: "Income, expenses, budgeting and financial reporting with clear dashboards that give managers full visibility.",
    content: `## Overview

Track income and expenses, set budgets and produce financial reports with dashboards that make the numbers easy to understand.`,
    features: ["Income tracking", "Expense tracking", "Budgeting", "Financial reporting", "Dashboards"],
    technologies: [],
    projectStatus: "COMPLETED",
    clientType: "SMEs & organizations",
    order: 14,
    screenshot: "financial.png",
    accent: ["#d97706", "#fbbf24"],
  },
];

export const POSTS = [
  {
    title: "Welcome to the new Raremedia website and content platform",
    slug: "welcome-to-the-new-raremedia-platform",
    category: "company-updates",
    type: "ANNOUNCEMENT",
    excerpt: "Our new website is more than a brochure: it is a portfolio, image gallery, project request platform and content management system in one.",
    tags: ["announcement", "website", "cms"],
    content: `*Demo article created with the initial content. Edit or delete it from the admin dashboard.*

We have launched a new home for Raremedia. Beyond presenting our services and projects, the site now includes:

- A **portfolio** with filterable projects and image galleries
- A **project request** form so you can brief us in a structured way
- A **blog** for updates, tutorials and case studies
- A secure **admin dashboard** our team uses to publish new work without touching code

Every project page shows features, technologies and status, and you can request a similar system in one click.

If you have an idea for a website, business system, booking platform or AI application, [start your project](/request-project) today.`,
  },
  {
    title: "How a POS system changes a small shop's day",
    slug: "how-a-pos-system-changes-a-small-shops-day",
    category: "technology",
    type: "ARTICLE",
    excerpt: "From counting stock by hand to knowing your best customers: what a point-of-sale system actually does for a shop or bar.",
    tags: ["POS", "inventory", "small business"],
    content: `*Demo article created with the initial content. Edit or delete it from the admin dashboard.*

## Before: notebooks and guesswork

Many shops record sales in a notebook and count stock at the end of the month. Mistakes creep in, slow-moving products hide on the shelf and it is hard to know which customers keep the business alive.

## After: one screen at the counter

A POS system records every sale in seconds, reduces stock automatically and prints or sends a receipt. The owner opens a dashboard and sees today's sales, low-stock items and top customers.

## Offline matters

Connectivity is not always reliable. Our POS systems keep working offline and synchronise when the connection returns, so the counter never stops.

## What to look for

1. Fast product search and barcode support
2. Stock alerts
3. Customer history
4. Simple reports you actually read
5. Local support when you need help

Want to see it in action? Look at our [Bar POS System](/projects/bar-pos-system) or [request a POS](/request-project?type=POS) for your business.`,
  },
  {
    title: "Why cooperatives are moving their records to Ikimina Management System",
    slug: "why-cooperatives-are-moving-to-ikimina-management-system",
    category: "case-studies",
    type: "CASE_STUDY",
    excerpt: "Members, contributions, loans and meetings in one place, with receipts and PDF reports that build trust.",
    tags: ["ikimina", "cooperatives", "case study"],
    content: `*Demo article created with the initial content. Edit or delete it from the admin dashboard.*

## The challenge

Savings groups handle money for dozens or hundreds of members. Paper ledgers make it hard to answer simple questions: how much has each member contributed, which loans are overdue and what was decided at the last meeting?

## The solution

The [Ikimina Management System](/projects/ikimina-management-system) records contributions, loans and repayments with receipts, keeps meeting records and produces PDF statements and reports on demand. Roles and audit logs make every change traceable, and each organization's data is isolated.

## Outcome

Treasurers spend less time reconciling and members get clear statements, which builds trust in the group.

Interested in a cooperative system? [Talk to Raremedia](/contact).`,
  },
];

export const SETTINGS: Record<string, string> = {
  "site.tagline": "Digital solutions built for modern businesses.",
  "site.description": "Raremedia is a software development and digital technology company in Rwanda building professional websites, business management systems, POS systems, booking platforms, AI-powered applications and custom software.",
  "social.linkedin": "https://www.linkedin.com/in/isaie-uwiragiye-491a8b428/",
  "social.x": "https://x.com/ikiminasystem",
  "social.instagram": "https://www.instagram.com/raremedia2/",
  "social.whatsapp": "https://wa.me/250781425110",
  "site.footerNote": "Built in Rwanda.",
};
