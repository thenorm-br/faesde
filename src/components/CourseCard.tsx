import { Calendar, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  title: string;
  description: string;
  image: string;
  originalPrice: string;
  discountedPrice: string;
  installments: string;
}

const CourseCard = ({
  title,
  description,
  image,
  originalPrice,
  discountedPrice,
  installments,
}: CourseCardProps) => {
  return (
    <article className="group card-hover flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-card">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={image}
          alt={`Capa do curso: ${title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ecid-blue-light px-3 py-1 text-xs font-medium text-ecid-navy">
            <Calendar className="h-3.5 w-3.5" />
            Início imediato
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ecid-green/10 px-3 py-1 text-xs font-medium text-ecid-green">
            <BadgeCheck className="h-3.5 w-3.5" />
            MEC
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {description}
        </p>

        {/* Pricing */}
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground line-through">
              De {originalPrice}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-ecid-green">Por</span>
            <span className="text-2xl font-extrabold text-foreground">
              {discountedPrice}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{installments}</span> s/ juros no cartão
          </p>
        </div>

        {/* CTA */}
        <Button className="mt-4 w-full rounded-full bg-ecid-navy font-semibold text-primary-foreground transition-all hover:bg-ecid-navy-dark hover:shadow-lg">
          Ver curso
        </Button>
      </div>
    </article>
  );
};

export default CourseCard;
