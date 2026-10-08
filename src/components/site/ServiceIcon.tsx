import {
  Bot,
  Building2,
  CalendarCheck,
  Code2,
  FileSignature,
  Globe,
  GraduationCap,
  LayoutDashboard,
  type LucideProps,
  MonitorSmartphone,
  Package,
  Sparkles,
  Sprout,
  Store,
  Users,
  Wrench,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  globe: Globe,
  dashboard: LayoutDashboard,
  building: Building2,
  pos: Store,
  package: Package,
  booking: CalendarCheck,
  ai: Bot,
  sparkles: Sparkles,
  social: Users,
  agriculture: Sprout,
  code: Code2,
  mobile: MonitorSmartphone,
  education: GraduationCap,
  documents: FileSignature,
  support: Wrench,
};

export const SERVICE_ICON_KEYS = Object.keys(ICONS);

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Code2;
  return <Icon className={className} aria-hidden="true" />;
}
