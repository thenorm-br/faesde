export interface CourseCategoryMeta {
  slug: string;
  label: string;
  cardLabel: string;
  sectionTitle: string;
  sectionHighlight: string;
  description: string;
  order: number;
}

export const DEFAULT_COURSE_CATEGORIES: CourseCategoryMeta[] = [
  {
    slug: "extensao",
    label: "Extensão",
    cardLabel: "Curso por Extensão EAD",
    sectionTitle: "Cursos por Extensão EAD",
    sectionHighlight: "Extensão",
    description: "Cursos livres e de extensão em formato EAD.",
    order: 10,
  },
  {
    slug: "competencia",
    label: "Competência",
    cardLabel: "Certificação por Competência",
    sectionTitle: "Certificação por Competência",
    sectionHighlight: "Competência",
    description: "Certificações por competência profissional.",
    order: 20,
  },
  {
    slug: "pos-tecnico",
    label: "Pós-Técnico",
    cardLabel: "Pós-Técnico EAD",
    sectionTitle: "Cursos Pós-Técnicos EAD",
    sectionHighlight: "Pós-Técnicos",
    description: "Especializações e cursos pós-técnicos.",
    order: 30,
  },
  {
    slug: "segundo-grau",
    label: "Segundo Grau",
    cardLabel: "EJA - Ensino Medio",
    sectionTitle: "Segundo Grau e EJA",
    sectionHighlight: "EJA",
    description: "Cursos de segundo grau e EJA.",
    order: 40,
  },
];

const DEFAULT_META_BY_SLUG = new Map(DEFAULT_COURSE_CATEGORIES.map((category) => [category.slug, category]));

export function slugifyCategory(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function humanizeCategorySlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCourseCategoryMeta(slug: string): CourseCategoryMeta {
  const known = DEFAULT_META_BY_SLUG.get(slug);
  if (known) return known;

  const label = humanizeCategorySlug(slug || "sem-categoria");
  return {
    slug,
    label,
    cardLabel: label,
    sectionTitle: label,
    sectionHighlight: label.split(" ")[0] || label,
    description: "Categoria personalizada criada no painel admin.",
    order: 1000,
  };
}

export function getCourseCategoryLabel(slug: string) {
  return getCourseCategoryMeta(slug).label;
}

export function getCourseCardLabel(slug: string) {
  return getCourseCategoryMeta(slug).cardLabel;
}

export function buildCategoryMetas(slugs: string[]) {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  return uniqueSlugs
    .map(getCourseCategoryMeta)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "pt-BR"));
}
