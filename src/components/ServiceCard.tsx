import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  color: "green" | "yellow" | "red";
  featured?: boolean;
}

const colorClasses = {
  green: {
    border: "hover:border-african-green/50",
    glow: "group-hover:shadow-[0_8px_30px_-4px_hsl(var(--african-green)/0.2)]",
    badge: "bg-african-green text-white",
  },
  yellow: {
    border: "hover:border-african-yellow/50",
    glow: "group-hover:shadow-[0_8px_30px_-4px_hsl(var(--african-yellow)/0.25)]",
    badge: "bg-african-yellow text-foreground",
  },
  red: {
    border: "hover:border-african-red/50",
    glow: "group-hover:shadow-[0_8px_30px_-4px_hsl(var(--african-red)/0.2)]",
    badge: "bg-african-red text-white",
  },
};

export function ServiceCard({ title, description, image, href, color, featured }: ServiceCardProps) {
  const colors = colorClasses[color];

  return (
    <Link
      to={href}
      className={`group relative block rounded-2xl bg-card border border-border shadow-soft transition-all duration-300 hover:-translate-y-2 ${colors.border} ${colors.glow} overflow-hidden ${featured ? 'ring-2 ring-african-yellow/30' : ''}`}
    >
      {featured && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-african-yellow text-foreground text-xs font-semibold shadow-lg">
          ⭐ Populaire
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Title overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading font-bold text-xl text-white drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${colors.badge}`}>
            Service disponible
          </span>
          <div className="flex items-center text-sm font-medium text-primary">
            <span>Commander</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
