import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Parabéns fiz o curso técnico em edificações e já peguei o meu diploma e já ta registrado no MEC to muito feliz obrigado.",
    author: "MA Ribeiro",
    source: "Avaliações do Google",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  },
  {
    text: "Conclui meu curso de técnico em eletrotécnica, já recebi meu certificado na data que a instituição me informou, sempre com um excelente atendimento e dedicação dos funcionários… Venho parabenizar a Faesde pelo ótimo trabalho.",
    author: "Ricardo Vecci",
    source: "Avaliações do Google",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
  },
  {
    text: "Pode confiar nesta instituição concluir meu curso e já recebi meu certificado.",
    author: "Mauro Henrique",
    source: "Avaliações do Google",
    initials: "M",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">Depoimentos</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Veja o que nossos alunos falam sobre a experiência na FAESDE.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-hover relative rounded-2xl bg-card p-6 shadow-sm"
            >
              {/* Quote Icon */}
              <Quote className="absolute right-6 top-6 h-8 w-8 text-accent/20" />

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-faesde-orange text-faesde-orange"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="mb-6 text-foreground/80">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {testimonial.initials}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.source}</p>
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
