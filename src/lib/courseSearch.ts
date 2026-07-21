// Course search utility: accent-insensitive, multi-token, synonym-aware, scored.
import { getCourseCategoryMeta } from "@/lib/courseCategories.ts";

export const normalize = (s: string): string =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Synonyms / related keywords map. Key and values are normalized (no accents).
// Searching any term expands to its group so users find related courses.
const SYNONYM_GROUPS: string[][] = [
  ["enfermagem", "saude", "hospital", "paciente", "cuidados", "idosos", "idoso"],
  ["radiologia", "raio x", "imagem", "tomografia", "ressonancia"],
  ["estetica", "beleza", "cosmetica", "spa", "skincare"],
  ["nutricao", "dietetica", "alimentacao", "dieta", "nutricionista"],
  ["saude bucal", "dental", "dentista", "odontologia", "odonto"],
  ["biotecnologia", "biotec", "laboratorio", "biologia"],
  ["veterinaria", "animais", "pet", "veterinario"],
  ["seguranca do trabalho", "sst", "epi", "nr", "trabalho"],
  ["informatica", "computador", "computacao", "internet", "ti", "tecnologia"],
  ["desenvolvimento de sistemas", "programacao", "programador", "software", "codigo", "dev", "developer", "sistemas"],
  ["redes de computadores", "redes", "infraestrutura", "network", "wifi"],
  ["smartphones", "celular", "celulares", "mobile", "android", "ios", "manutencao de celular"],
  ["design grafico", "design", "photoshop", "ilustrador", "arte", "grafico"],
  ["libras", "tradutor", "interprete", "surdos", "lingua de sinais"],
  ["energia renovavel", "solar", "fotovoltaica", "eolica", "sustentavel"],
  ["maquinas industriais", "industrial", "industria", "manutencao industrial"],
  ["maquinas pesadas", "tratores", "escavadeira", "operador"],
  ["metalurgia", "metal", "fundicao", "siderurgia"],
  ["soldagem", "solda", "soldador", "mig", "tig"],
  ["aquicultura", "peixes", "piscicultura", "carcinicultura"],
  ["prevencao e combate ao incendio", "bombeiro", "incendio", "fogo", "brigada"],
  ["defesa civil", "emergencia", "desastres"],
  ["transito", "trafego", "transporte", "habilitacao"],
  ["gastronomia", "cozinha", "chef", "culinaria", "alimentos"],
  ["gerencia em saude", "gestao em saude", "administracao hospitalar"],
  ["agente comunitario de saude", "acs", "comunitario", "saude publica"],
  ["equipamentos biomedicos", "biomedico", "equipamentos medicos"],
  ["eletricista", "eletrica", "eletricidade", "eletrotecnica", "eletronica"],
  ["administracao", "gestao", "negocios", "empresa"],
  ["contabilidade", "contador", "fiscal", "contabil"],
  ["logistica", "transporte", "armazenagem", "supply chain"],
  ["meio ambiente", "ambiental", "sustentabilidade", "ecologia"],
  ["vendas", "comercial", "varejo", "atendimento"],
  ["secretariado", "secretaria", "assistente"],
];

const expandQuery = (token: string): string[] => {
  const set = new Set<string>([token]);
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => g.includes(token) || token.includes(g))) {
      group.forEach((g) => set.add(g));
    }
  }
  return Array.from(set);
};

const categoryLabel = (c: string): string => {
  const meta = getCourseCategoryMeta(c);
  return [meta.label, meta.cardLabel, meta.sectionTitle, meta.description, c].join(" ");
};

export interface SearchableCourse {
  title: string;
  description?: string | null;
  category: string;
  slug: string;
}

export const scoreCourse = (course: SearchableCourse, query: string): number => {
  const q = normalize(query);
  if (!q) return 1;

  const haystack = normalize(
    [course.title, course.description || "", categoryLabel(course.category), course.slug.replace(/-/g, " ")].join(" ")
  );

  const tokens = q.split(" ").filter((t) => t.length >= 2);
  if (tokens.length === 0) return haystack.includes(q) ? 1 : 0;

  let score = 0;
  for (const token of tokens) {
    const expansions = expandQuery(token);
    let tokenHit = 0;
    for (const variant of expansions) {
      if (!variant) continue;
      if (haystack.includes(variant)) {
        // exact token gets higher weight than synonyms
        tokenHit = Math.max(tokenHit, variant === token ? 3 : 1.5);
      }
    }
    // fuzzy: prefix or partial substring (>=4 chars) of any haystack word
    if (tokenHit === 0 && token.length >= 4) {
      const partial = token.slice(0, Math.max(4, token.length - 1));
      if (haystack.includes(partial)) tokenHit = 0.8;
    }
    score += tokenHit;
  }

  // bonus when title contains the raw query
  if (normalize(course.title).includes(q)) score += 2;
  return score;
};

export const getRelatedKeywords = (query: string, max = 6): string[] => {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ").filter(Boolean);
  const related = new Set<string>();
  for (const t of tokens) {
    for (const group of SYNONYM_GROUPS) {
      if (group.some((g) => g.includes(t) || t.includes(g))) {
        group.forEach((g) => {
          if (g !== t && !q.includes(g)) related.add(g);
        });
      }
    }
  }
  return Array.from(related).slice(0, max);
};
