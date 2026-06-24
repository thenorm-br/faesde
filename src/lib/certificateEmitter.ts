import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const PREPS = new Set(["de", "da", "do", "das", "dos", "e"]);

export const toTitleCasePt = (s: string) =>
  (s || "")
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) =>
      PREPS.has(w) && i > 0 ? w : w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1)
    )
    .join(" ");

export const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const formatDateExtenso = (iso: string, cidade = "Aracruz") => {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return `${cidade}, ${d} de ${MESES[m - 1]} de ${y}`;
};

export interface CertificateEmitData {
  code: string;
  student_name: string;
  cpf?: string | null;
  course_name: string;
  hours: number;
  completion_date: string; // YYYY-MM-DD
  book_number?: string | null;
  page_number?: string | null;
  content?: string | null;
}

export async function emitCertificateDocx(c: CertificateEmitData) {
  const res = await fetch("/certificate-template.docx");
  if (!res.ok) throw new Error("Template não encontrado");
  const buf = await res.arrayBuffer();
  const zip = new PizZip(buf);
  const doc = new Docxtemplater(zip, {
    delimiters: { start: "{", end: "}" },
    paragraphLoop: true,
    linebreaks: true,
  });

  const nomeUpper = (c.student_name || "").toLocaleUpperCase("pt-BR");
  const nomeTitle = toTitleCasePt(c.student_name);
  const cursoUpper = (c.course_name || "").toLocaleUpperCase("pt-BR");
  const cursoTitle = toTitleCasePt(c.course_name);

  doc.render({
    nome_sig: nomeTitle,
    nome_upper: nomeUpper,
    nome_title: nomeTitle,
    curso_upper: cursoUpper,
    curso_title: cursoTitle,
    cpf: c.cpf || "",
    data_emissao: formatDateBR(c.completion_date),
    carga_horaria: String(c.hours),
    cidade_data_extenso: formatDateExtenso(c.completion_date),
    codigo: c.code,
    folha: c.page_number || "",
    livro: c.book_number || "",
    conteudo: c.content || "",
  });

  const out = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  saveAs(out, `certificado-${c.code}.docx`);
}
