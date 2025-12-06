import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Parabéns fiz o curso técnico em edificações e já peguei o meu diploma e já ta registrado no MEC to muito feliz obrigado.",
    author: "MA Ribeiro",
    source: "Avaliações do Google",
    rating: 5,
  },
  {
    text: "Conclui meu curso de técnico em eletrotécnica, já recebi meu certificado na data que a instituição me informou, sempre com um excelente atendimento e dedicação dos funcionários.",
    author: "Ricardo Vecci",
    source: "Avaliações do Google",
    rating: 5,
  },
  {
    text: "Pode confiar nesta instituição concluir meu curso e já recebi meu certificado. Recomendo a todos que querem uma formação técnica de qualidade.",
    author: "Mauro Henrique",
    source: "Avaliações do Google",
    rating: 5,
  },
  {
    text: "Excelente escola! Fiz meu curso técnico em segurança do trabalho e hoje estou empregado na área. Agradeço muito à FAESDE!",
    author: "Carlos Silva",
    source: "Avaliações do Google",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="bg-ecid-navy py-16 md:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
            O que nossos alunos dizem
          </h2>
          <p className="mx-auto max-w-2xl text-primary-foreground/70">
            Veja os depoimentos de quem já conquistou sua certificação técnica conosco.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-hover relative rounded-2xl bg-card p-6"
            >
              {/* Quote Icon */}
              <Quote className="absolute right-4 top-4 h-8 w-8 text-ecid-blue-accent/20" />

              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-ecid-yellow text-ecid-yellow"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="mb-6 text-sm text-foreground/80 line-clamp-4">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ecid-navy text-sm font-bold text-primary-foreground">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
