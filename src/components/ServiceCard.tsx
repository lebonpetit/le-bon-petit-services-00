import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: "green" | "yellow" | "red";
  featured?: boolean;
}

const colorClasses = {
  green: {
    bg: "bg-african-green/10",
    icon: "text-african-green",
    border: "hover:border-african-green/30",
    glow: "group-hover:shadow-[0_8px_30px_-4px_hsl(var(--african-green)/0.15)]",
  },
  yellow: {
    bg: "bg-african-yellow/10",
    icon: "text-african-gold",
    border: "hover:border-african-yellow/30",
    glow: "group-hover:shadow-[0_8px_30px_-4px_hsl(var(--african-yellow)/0.2)]",
  },
  red: {
    bg: "bg-african-red/10",
    icon: "text-african-red",
    border: "hover:border-african-red/30",
    glow: "group-hover:shadow-[0_8px_30px_-4px_hsl(var(--african-red)/0.15)]",
  },
};

export function ServiceCard({ title, description, icon: Icon, href, color, featured }: ServiceCardProps) {
  const colors = colorClasses[color];

  return (
    <Link
      to={href}
      className={`group relative block p-6 rounded-2xl bg-card border border-border shadow-soft transition-all duration-300 hover:-translate-y-1 ${colors.border} ${colors.glow} ${featured ? 'ring-2 ring-african-yellow/20' : ''}`}
    >
      {featured && (
        <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-african-yellow text-accent-foreground text-xs font-semibold shadow-glow">
          Populaire
        </div>
      )}
      
      <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`h-7 w-7 ${colors.icon}`} />
      </div>

      <h3 className="font-heading font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      <div className="flex items-center text-sm font-medium text-primary">
        <span>Commander</span>
        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none african-pattern" />
    </Link>
  );
}
