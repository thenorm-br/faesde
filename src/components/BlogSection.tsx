import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    title: "Técnico em Redes vs Automação vs Eletrotécnica: Qual Curso Escolher em 2025?",
    description: "Descubra as diferenças entre esses cursos técnicos e faça a melhor escolha para sua carreira.",
    date: "17 de julho de 2025",
    category: "Orientação Profissional",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
  },
  {
    title: "O que faz um Técnico em Química CBO?",
    description: "Conheça as responsabilidades e oportunidades na área de química técnica.",
    date: "19 de março de 2025",
    category: "Carreiras",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80",
  },
  {
    title: "Quanto tempo dura Design de Interiores?",
    description: "Saiba tudo sobre a duração e estrutura do curso de Design de Interiores.",
    date: "19 de março de 2025",
    category: "Design de Interiores",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80",
  },
];

const BlogSection = () => {
  return (
    <section id="blog" className="bg-secondary py-16 md:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Blog</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Fique por dentro das últimas novidades e dicas sobre educação técnica e mercado de trabalho.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="group card-hover overflow-hidden rounded-2xl bg-card shadow-sm"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {post.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-faesde-orange-dark"
                  >
                    Leia mais
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All */}
        <div className="mt-10 text-center">
          <Button className="rounded-full bg-primary px-8 font-semibold text-primary-foreground hover:bg-faesde-blue-dark">
            VER TODOS OS POSTS
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
