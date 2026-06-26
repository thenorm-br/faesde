import jsPDF from "jspdf";
import QRCode from "qrcode";

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

export interface CertificatePdfData {
  code: string;
  student_name: string;
  cpf?: string | null;
  course_name: string;
  hours: number;
  completion_date: string;
  book_number?: string | null;
  page_number?: string | null;
  content?: string | null;
}

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const imgToDataUrl = (img: HTMLImageElement): string => {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d")!.drawImage(img, 0, 0);
  return c.toDataURL("image/jpeg", 0.9);
};

// A4 in mm
const PW = 210;
const PH = 297;

// Draw bold/regular runs on the same line (with optional justification)
type Run = { text: string; bold?: boolean };

const drawRuns = (
  pdf: jsPDF,
  runs: Run[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: "left" | "center" | "right" | "justify" = "left",
  fontSize = 10
) => {
  pdf.setFontSize(fontSize);
  // Flatten runs into tokens (word + leading space + bold flag)
  type Tok = { word: string; bold: boolean };
  const tokens: Tok[] = [];
  runs.forEach((r) => {
    const parts = r.text.split(/(\s+)/);
    let buf = "";
    parts.forEach((p) => {
      if (/\s+/.test(p)) {
        if (buf) {
          tokens.push({ word: buf, bold: !!r.bold });
          buf = "";
        }
      } else {
        buf += p;
      }
    });
    if (buf) tokens.push({ word: buf, bold: !!r.bold });
  });

  const wordWidth = (t: Tok) => {
    pdf.setFont("helvetica", t.bold ? "bold" : "normal");
    return pdf.getTextWidth(t.word);
  };
  const spaceW = () => {
    pdf.setFont("helvetica", "normal");
    return pdf.getTextWidth(" ");
  };

  // Build lines
  const lines: Tok[][] = [];
  let line: Tok[] = [];
  let lineW = 0;
  const sw = spaceW();
  tokens.forEach((t) => {
    const w = wordWidth(t);
    const need = line.length ? lineW + sw + w : w;
    if (need > maxWidth && line.length) {
      lines.push(line);
      line = [t];
      lineW = w;
    } else {
      if (line.length) lineW += sw + w;
      else lineW = w;
      line.push(t);
    }
  });
  if (line.length) lines.push(line);

  lines.forEach((ln, idx) => {
    const yy = y + idx * lineHeight;
    const isLast = idx === lines.length - 1;
    const widths = ln.map(wordWidth);
    const totalWords = widths.reduce((a, b) => a + b, 0);
    const gaps = ln.length - 1;

    if (align === "justify" && !isLast && gaps > 0) {
      const gap = (maxWidth - totalWords) / gaps;
      let cx = x;
      ln.forEach((t, i) => {
        pdf.setFont("helvetica", t.bold ? "bold" : "normal");
        pdf.text(t.word, cx, yy);
        cx += widths[i] + gap;
      });
    } else {
      const total = totalWords + gaps * sw;
      let cx = x;
      if (align === "center") cx = x + (maxWidth - total) / 2;
      else if (align === "right") cx = x + (maxWidth - total);
      ln.forEach((t, i) => {
        pdf.setFont("helvetica", t.bold ? "bold" : "normal");
        pdf.text(t.word, cx, yy);
        cx += widths[i] + (i < ln.length - 1 ? sw : 0);
      });
    }
  });

  return lines.length * lineHeight;
};

export async function emitCertificatePdf(c: CertificatePdfData) {
  const nomeUpper = (c.student_name || "").toLocaleUpperCase("pt-BR");
  const nomeTitle = toTitleCasePt(c.student_name);
  const cursoUpper = (c.course_name || "").toLocaleUpperCase("pt-BR");
  const cursoTitle = toTitleCasePt(c.course_name);
  const hoursStr = `${c.hours} HORAS`;
  const dataBR = formatDateBR(c.completion_date);
  const extenso = formatDateExtenso(c.completion_date);

  const publicUrl = `https://www.faesde.com.br/certificados/${c.code}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 400, margin: 1 });

  const [bg1, bg2, mecSeal] = await Promise.all([
    loadImage("/certificado/bg-page1.jpg"),
    loadImage("/certificado/bg-page2.jpg"),
    loadImage("/certificado/image5.png"),
  ]);
  const bg1Url = imgToDataUrl(bg1);
  const bg2Url = imgToDataUrl(bg2);
  const mecUrl = (() => {
    const c2 = document.createElement("canvas");
    c2.width = mecSeal.naturalWidth;
    c2.height = mecSeal.naturalHeight;
    c2.getContext("2d")!.drawImage(mecSeal, 0, 0);
    return c2.toDataURL("image/png");
  })();

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // -------- PAGE 1 --------
  pdf.addImage(bg1Url, "JPEG", 0, 0, PW, PH);
  // MEC seal (bottom-left)
  pdf.addImage(mecUrl, "PNG", 14, 218, 24, 24);
  pdf.setTextColor(0, 0, 0);

  // Body paragraph 1 (justified)
  // text area: x=40, width=130 mm, start y~92mm
  const bodyX = 40;
  const bodyW = 130;
  let cy = 92;

  drawRuns(
    pdf,
    [
      { text: "Certificamos para os devidos fins, que " },
      { text: nomeUpper, bold: true },
      ...(c.cpf
        ? ([{ text: " portador(a) do " }, { text: `CPF: ${c.cpf}`, bold: true }] as Run[])
        : []),
      { text: " concluiu com êxito o curso livre de aperfeiçoamento:" },
    ],
    bodyX,
    cy,
    bodyW,
    5.5,
    "justify",
    11
  );

  // Course title (centered, bold)
  cy = 124;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  const courseLines = pdf.splitTextToSize(cursoUpper, bodyW);
  courseLines.forEach((line: string, i: number) => {
    pdf.text(line, PW / 2, cy + i * 8, { align: "center" });
  });

  // Body paragraph 2 (justified)
  cy = 152;
  drawRuns(
    pdf,
    [
      { text: "Em " },
      { text: dataBR, bold: true },
      { text: " com carga horária de " },
      { text: hoursStr, bold: true },
      {
        text:
          ", nos termos do Decreto Presidencial nº 5.154, de 23 de julho de 2004, Art 1º e 3º e de acordo com as normas do Ministério da Educação (MEC) pela resolução CNE nº 04/99, Art 11.",
      },
    ],
    bodyX,
    cy,
    bodyW,
    5.5,
    "justify",
    11
  );

  // "Aracruz, ..." right-aligned bold
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(extenso, bodyX + bodyW, 188, { align: "right" });

  // Registry paragraph (centered, smaller)
  drawRuns(
    pdf,
    [
      { text: "O presente documento foi registrado sob o número " },
      { text: c.code, bold: true },
      ...(c.page_number
        ? ([{ text: ", em folha " }, { text: c.page_number, bold: true }] as Run[])
        : []),
      ...(c.book_number
        ? ([{ text: " do livro nº " }, { text: c.book_number, bold: true }] as Run[])
        : []),
      { text: " desta instituição de ensino listagem publicada no diário eletrônico no site FAESDE" },
    ],
    bodyX + 10,
    200,
    bodyW - 20,
    5,
    "center",
    9.5
  );
  // Override code color to red by re-drawing it in red (find approx; instead redraw whole paragraph w/red code)
  // Simpler: draw red code line atop
  // (kept as-is; code stays black for reliability)

  // Aluno block (above Cleide signature) — centered ~ x=97.5, y=243-252
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const aluX = 97.5;
  pdf.text(nomeTitle, aluX, 243, { align: "center" });
  pdf.text("Aluno – Faesde EAD", aluX, 248, { align: "center" });
  pdf.setFont("helvetica", "bold");
  if (c.cpf) pdf.text(`CPF: ${c.cpf}`, aluX, 253, { align: "center" });

  // QR Code (bottom-left, matching original position) ~x=15, y=245, size 22mm
  pdf.addImage(qrDataUrl, "PNG", 15, 245, 22, 22);

  // -------- PAGE 2 --------
  pdf.addPage();
  pdf.addImage(bg2Url, "JPEG", 0, 0, PW, PH);
  pdf.setTextColor(0, 0, 0);

  // Header block centered
  pdf.setFontSize(11);
  let y2 = 90;
  const lineH2 = 6;
  const block: Array<[string, string]> = [
    ["Curso: ", cursoTitle],
    ["Nome: ", nomeTitle],
    ["Carga Horária ", `${c.hours} horas`],
    ["Número do Certificado: ", c.code],
  ];
  block.forEach(([label, value], i) => {
    pdf.setFont("helvetica", "normal");
    const lw = pdf.getTextWidth(label);
    pdf.setFont("helvetica", i === 3 ? "normal" : "normal");
    const vw = pdf.getTextWidth(value);
    const total = lw + vw;
    const startX = (PW - total) / 2;
    pdf.setFont("helvetica", "normal");
    pdf.text(label, startX, y2 + i * lineH2);
    if (i === 3) pdf.setTextColor(192, 57, 43);
    pdf.text(value, startX + lw, y2 + i * lineH2);
    pdf.setTextColor(0, 0, 0);
  });

  // Title "CONTEÚDO PROGRAMÁTICO"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("CONTEÚDO PROGRAMÁTICO", PW / 2, 128, { align: "center" });

  // Content list (centered lines)
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  const content = (c.content || "Conteúdo programático não informado.").trim();
  const items = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  let cy2 = 138;
  const maxItemW = 160;
  items.forEach((item) => {
    const lines = pdf.splitTextToSize(item.trim(), maxItemW);
    lines.forEach((ln: string) => {
      pdf.text(ln, PW / 2, cy2, { align: "center" });
      cy2 += 5.2;
    });
  });

  pdf.save(`certificado-${c.code}.pdf`);
}
