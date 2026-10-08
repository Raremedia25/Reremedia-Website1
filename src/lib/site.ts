// Static brand information. Editable values (social links, tagline, etc.)
// live in SiteSetting and are read through src/lib/settings.ts.

export const SITE = {
  name: "Raremedia",
  legalName: "Raremedia",
  tagline: "Websites → Business Systems → Advanced Platforms → AI-Powered Solutions",
  description:
    "Raremedia is a software development and digital technology company in Rwanda building professional websites, business management systems, POS systems, booking platforms, AI-powered applications and custom software.",
  email: "isaie.rare@gmail.com",
  phone: "+250 781 425 110",
  phoneHref: "tel:+250781425110",
  country: "Rwanda",
  city: "Kigali",
  journey: ["Websites", "Business Systems", "Advanced Platforms", "AI-Powered Solutions"],
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/solutions", label: "Solutions" },
  { href: "/projects", label: "Projects" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_SERVICES = [
  { href: "/services#website-development", label: "Websites" },
  { href: "/services#business-management-systems", label: "Business Systems" },
  { href: "/services#sales-inventory", label: "POS" },
  { href: "/services#booking-reservation", label: "Booking" },
  { href: "/services#ai-automation", label: "AI" },
  { href: "/services#custom-software", label: "Custom Software" },
] as const;

export const TECHNOLOGIES = [
  { group: "Frontend", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"] },
  { group: "Backend", items: ["Node.js", "Java", "Spring Boot", "REST APIs"] },
  { group: "Data", items: ["PostgreSQL", "MySQL", "SQLite", "Firebase"] },
  { group: "AI & Cloud", items: ["AI APIs", "Automation", "Cloud technologies", "Electron"] },
] as const;
