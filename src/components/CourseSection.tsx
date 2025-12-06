import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseCard from "./CourseCard";
import { useRef, useState } from "react";

interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  originalPrice: string;
  discountedPrice: string;
  installments: string;
}

interface CourseSectionProps {
  title: string;
  highlight?: string;
  courses: Course[];
}

const CourseSection = ({ title, highlight, courses }: CourseSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            {title}{" "}
            {highlight && (
              <span className="relative text-ecid-navy">
                {highlight}
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent/30" />
              </span>
            )}
          </h2>
          <Button
            variant="link"
            className="hidden font-semibold text-ecid-navy hover:text-accent sm:flex"
          >
            Ver todos
          </Button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 rounded-full border-border bg-card shadow-lg transition-all hover:bg-muted md:flex ${
              !canScrollLeft && "opacity-0 pointer-events-none"
            }`}
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 rounded-full border-border bg-card shadow-lg transition-all hover:bg-muted md:flex ${
              !canScrollRight && "opacity-0 pointer-events-none"
            }`}
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="scrollbar-hide -mx-4 flex gap-5 overflow-x-auto px-4 pb-4 scroll-smooth snap-x snap-mandatory md:mx-0 md:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {courses.map((course) => (
              <div
                key={course.id}
                className="w-[280px] flex-shrink-0 snap-start md:w-[300px]"
              >
                <CourseCard {...course} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View All */}
        <div className="mt-4 flex justify-center sm:hidden">
          <Button
            variant="outline"
            className="rounded-full font-semibold text-ecid-navy hover:bg-ecid-blue-light"
          >
            Ver todos os cursos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
