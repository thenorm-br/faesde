import jsPDF from "jspdf";
import QRCode from "qrcode";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const PREPS = new Set(["de", "da", "do", "das", "dos", "e"]);

const PW = 210;
const PH = 297;
const CERTIFICATE_BG = "/certificado/modelo-timbrado-certificado.png";
const WATERMARK_OVERLAY = "/certificado/timbrado-marca-dagua.png";
const MEC_SEAL = "/certificado/image5.png";
const ABED_SEAL = "/certificado/abed-logo.png";
const SCRIPT_FONT = '"Edwardian Script ITC", "Brush Script MT", cursive';
const DEFAULT_FONT = "Calibri, Arial, sans-serif";
const DEFAULT_COLOR = "#000000";
const REGISTRY_RED = "#ff0000";

export const toTitleCasePt = (s: string) =>
  (s || "")
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) =>
      PREPS.has(w) && i > 0 ? w : w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1)
    )
    .join(" ");

const parseDateParts = (date: string) => {
  const value = (date || "").trim();
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return { y: Number(iso[1]), m: Number(iso[2]), d: Number(iso[3]) };

  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return { y: Number(br[3]), m: Number(br[2]), d: Number(br[1]) };

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      y: parsed.getFullYear(),
      m: parsed.getMonth() + 1,
      d: parsed.getDate(),
    };
  }

  return { y: 0, m: 1, d: 0 };
};

const twoDigits = (value: number) => String(value).padStart(2, "0");

export const formatDateBR = (date: string) => {
  const { y, m, d } = parseDateParts(date);
  if (!y || !d) return date || "";
  return `${twoDigits(d)}/${twoDigits(m)}/${y}`;
};

export const formatDateExtenso = (date: string, cidade = "Aracruz") => {
  const { y, m, d } = parseDateParts(date);
  if (!y || !d) return cidade;
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

export interface ResolvedCertificateRegistry {
  book_number: string;
  page_number: string;
}

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const normalizeDigits = (value?: string | null) => (value || "").replace(/\D/g, "");

export const formatCpf = (value?: string | null) => {
  const digits = normalizeDigits(value);
  if (digits.length !== 11) return value || "";
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const normalizeRegistryNumber = (value: string | null | undefined, size: number) => {
  const digits = normalizeDigits(value);
  if (!digits) return "";
  if (digits.length >= size) return digits;
  return digits.padStart(size, "0");
};

const seededNumber = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const generateRegistryNumbers = (seed: string): ResolvedCertificateRegistry => {
  const hash = seededNumber(seed || "FAESDE");
  const book = 100 + (hash % 900);
  const page = 1 + ((hash >>> 9) % 9999);
  return {
    book_number: String(book),
    page_number: String(page).padStart(4, "0"),
  };
};

export const resolveRegistryNumbers = (
  c: Pick<
    CertificatePdfData,
    "code" | "student_name" | "course_name" | "completion_date" | "book_number" | "page_number"
  >
): ResolvedCertificateRegistry => {
  const fallback = generateRegistryNumbers(
    `${c.code}|${c.student_name}|${c.course_name}|${c.completion_date}`
  );
  return {
    book_number: normalizeRegistryNumber(c.book_number, 3) || fallback.book_number,
    page_number: normalizeRegistryNumber(c.page_number, 4) || fallback.page_number,
  };
};

const mmToPx = (mm: number, pxPerMm: number) => mm * pxPerMm;
const ptToPx = (pt: number, pxPerMm: number) => (pt * pxPerMm) / 2.834645669;

type Run = { text: string; bold?: boolean; color?: string };
type Token = { text: string; bold: boolean; color?: string };

const normalizeCourseName = (courseName: string) => (courseName || "").replace(/\s+/g, " ").trim();

const tokenizeRuns = (runs: Run[]) =>
  runs.flatMap((run) =>
    run.text
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((text) => ({ text, bold: !!run.bold, color: run.color }))
  );

const setCanvasFont = (
  ctx: CanvasRenderingContext2D,
  bold: boolean,
  fontSizePx: number,
  fontFamily = DEFAULT_FONT
) => {
  ctx.font = `${bold ? 700 : 400} ${fontSizePx}px ${fontFamily}`;
};

const measureToken = (
  ctx: CanvasRenderingContext2D,
  token: Token,
  fontSizePx: number,
  fontFamily = DEFAULT_FONT
) => {
  setCanvasFont(ctx, token.bold, fontSizePx, fontFamily);
  return ctx.measureText(token.text).width;
};

const drawRunsCanvas = (
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: "left" | "center" | "right" | "justify" = "left",
  fontSizePx = 18,
  fontFamily = DEFAULT_FONT,
  color = DEFAULT_COLOR
) => {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;

  const tokens = tokenizeRuns(runs);
  const spaceWidth = (() => {
    setCanvasFont(ctx, false, fontSizePx, fontFamily);
    return ctx.measureText(" ").width;
  })();

  const lines: Token[][] = [];
  let line: Token[] = [];
  let lineWidth = 0;

  tokens.forEach((token) => {
    const tokenWidth = measureToken(ctx, token, fontSizePx, fontFamily);
    const nextWidth = line.length ? lineWidth + spaceWidth + tokenWidth : tokenWidth;
    if (line.length && nextWidth > maxWidth) {
      lines.push(line);
      line = [token];
      lineWidth = tokenWidth;
    } else {
      line.push(token);
      lineWidth = nextWidth;
    }
  });

  if (line.length) lines.push(line);

  lines.forEach((currentLine, idx) => {
    const baselineY = y + idx * lineHeight;
    const widths = currentLine.map((token) => measureToken(ctx, token, fontSizePx, fontFamily));
    const totalWords = widths.reduce((sum, width) => sum + width, 0);
    const gaps = currentLine.length - 1;
    const isLast = idx === lines.length - 1;

    if (align === "justify" && !isLast && gaps > 0) {
      const gap = (maxWidth - totalWords) / gaps;
      let cursor = x;
      currentLine.forEach((token, tokenIndex) => {
        setCanvasFont(ctx, token.bold, fontSizePx, fontFamily);
        ctx.fillStyle = token.color || color;
        ctx.fillText(token.text, cursor, baselineY);
        cursor += widths[tokenIndex] + gap;
      });
      return;
    }

    const total = totalWords + gaps * spaceWidth;
    let cursor = x;
    if (align === "center") cursor = x + (maxWidth - total) / 2;
    if (align === "right") cursor = x + (maxWidth - total);

    currentLine.forEach((token, tokenIndex) => {
      setCanvasFont(ctx, token.bold, fontSizePx, fontFamily);
      ctx.fillStyle = token.color || color;
      ctx.fillText(token.text, cursor, baselineY);
      cursor += widths[tokenIndex] + (tokenIndex < currentLine.length - 1 ? spaceWidth : 0);
    });
  });

  return lines.length * lineHeight;
};

const drawInlineRunsLine = (
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  centerX: number,
  y: number,
  fontSizePx: number,
  fontFamily = DEFAULT_FONT
) => {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const widths = runs.map((run) => {
    setCanvasFont(ctx, !!run.bold, fontSizePx, fontFamily);
    return ctx.measureText(run.text).width;
  });
  const total = widths.reduce((sum, width) => sum + width, 0);
  let cursor = centerX - total / 2;

  runs.forEach((run, index) => {
    setCanvasFont(ctx, !!run.bold, fontSizePx, fontFamily);
    ctx.fillStyle = run.color || DEFAULT_COLOR;
    ctx.fillText(run.text, cursor, y);
    cursor += widths[index];
  });
};

const drawInlineRunsAtX = (
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  x: number,
  y: number,
  fontSizePx: number,
  fontFamily = DEFAULT_FONT
) => {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let cursor = x;

  runs.forEach((run) => {
    setCanvasFont(ctx, !!run.bold, fontSizePx, fontFamily);
    ctx.fillStyle = run.color || DEFAULT_COLOR;
    ctx.fillText(run.text, cursor, y);
    cursor += ctx.measureText(run.text).width;
  });
};

const drawTextLine = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSizePx: number,
  options?: { bold?: boolean; color?: string; align?: CanvasTextAlign; fontFamily?: string }
) => {
  ctx.fillStyle = options?.color || DEFAULT_COLOR;
  ctx.textAlign = options?.align || "left";
  ctx.textBaseline = "alphabetic";
  setCanvasFont(ctx, !!options?.bold, fontSizePx, options?.fontFamily || DEFAULT_FONT);
  ctx.fillText(text, x, y);
};

const drawHorizontalLine = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  width: number,
  pxPerMm: number
) => {
  ctx.save();
  ctx.strokeStyle = "#2b2b2b";
  ctx.lineWidth = Math.max(1, pxPerMm * 0.12);
  ctx.beginPath();
  ctx.moveTo(centerX - width / 2, y);
  ctx.lineTo(centerX + width / 2, y);
  ctx.stroke();
  ctx.restore();
};

const drawSignatureBlock = (ctx: CanvasRenderingContext2D, pxPerMm: number) => {
  const centerX = (PW / 2) * pxPerMm;
  const nameY = mmToPx(269.5, pxPerMm);
  const underlineY = mmToPx(273.0, pxPerMm);
  const line1Y = mmToPx(276.8, pxPerMm);
  const line2Y = mmToPx(281.0, pxPerMm);
  const line3Y = mmToPx(285.2, pxPerMm);
  const lineWidth = mmToPx(72, pxPerMm);

  drawTextLine(ctx, "Cleide D. S. Santos", centerX, nameY, ptToPx(25, pxPerMm), {
    align: "center",
    fontFamily: SCRIPT_FONT,
  });

  drawHorizontalLine(ctx, centerX, underlineY, lineWidth, pxPerMm);

  drawTextLine(ctx, "Cleide Divino Silva Santos", centerX, line1Y, ptToPx(9, pxPerMm), {
    align: "center",
  });
  drawTextLine(ctx, "Diretor(a) - Faesde EAD", centerX, line2Y, ptToPx(9, pxPerMm), {
    align: "center",
  });
  drawTextLine(ctx, "CNPJ: 21.819.091/0001-61", centerX, line3Y, ptToPx(9, pxPerMm), {
    align: "center",
  });
};

const drawStudentBlock = (
  ctx: CanvasRenderingContext2D,
  pxPerMm: number,
  c: CertificatePdfData
) => {
  const centerX = (PW / 2) * pxPerMm;
  const formattedCpf = formatCpf(c.cpf);

  drawHorizontalLine(ctx, centerX, mmToPx(239.0, pxPerMm), mmToPx(64, pxPerMm), pxPerMm);
  drawTextLine(ctx, toTitleCasePt(c.student_name || ""), centerX, mmToPx(243.2, pxPerMm), ptToPx(10, pxPerMm), {
    align: "center",
  });
  drawTextLine(ctx, "Aluno - Faesde EAD", centerX, mmToPx(247.4, pxPerMm), ptToPx(10, pxPerMm), {
    align: "center",
  });
  if (formattedCpf) {
    drawTextLine(ctx, `CPF: ${formattedCpf}`, centerX, mmToPx(251.6, pxPerMm), ptToPx(10, pxPerMm), {
      bold: true,
      align: "center",
    });
  }
};

const drawCertificateTitle = (ctx: CanvasRenderingContext2D, pxPerMm: number) => {
  const centerX = (PW / 2) * pxPerMm;
  drawTextLine(ctx, "Certificado", centerX, mmToPx(74, pxPerMm), ptToPx(90, pxPerMm), {
    align: "center",
    fontFamily: SCRIPT_FONT,
  });
};

const drawCourseTitle = (ctx: CanvasRenderingContext2D, pxPerMm: number, courseName: string) => {
  const title = normalizeCourseName(courseName).toLocaleUpperCase("pt-BR");
  const bodyX = mmToPx(40, pxPerMm);
  const bodyW = mmToPx(137, pxPerMm);
  const isLong = title.length > 74;

  return drawRunsCanvas(
    ctx,
    [{ text: title, bold: true }],
    bodyX,
    mmToPx(116, pxPerMm),
    bodyW,
    mmToPx(isLong ? 6.5 : 8.7, pxPerMm),
    "center",
    ptToPx(isLong ? 13.2 : 18, pxPerMm)
  );
};

const createPageCanvas = async (bg: HTMLImageElement, watermark: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(watermark, 0, 0, canvas.width, canvas.height);

  return { canvas, ctx, pxPerMm: canvas.width / PW };
};

const drawRegistryBlock = (
  ctx: CanvasRenderingContext2D,
  pxPerMm: number,
  c: CertificatePdfData & ResolvedCertificateRegistry
) => {
  const blockX = mmToPx(55, pxPerMm);
  const fontSize = ptToPx(8.4, pxPerMm);

  drawInlineRunsAtX(
    ctx,
    [{ text: "O presente documento foi registrado sob o número" }],
    blockX,
    mmToPx(194.8, pxPerMm),
    fontSize
  );
  drawInlineRunsAtX(
    ctx,
    [
      { text: c.code, bold: true, color: REGISTRY_RED },
      { text: ", em folha " },
      { text: c.page_number, bold: true },
      { text: " do livro" },
    ],
    blockX,
    mmToPx(200.0, pxPerMm),
    fontSize
  );
  drawInlineRunsAtX(
    ctx,
    [
      { text: "nº " },
      { text: c.book_number, bold: true },
      { text: " desta instituição de ensino listagem publicada" },
    ],
    blockX,
    mmToPx(205.2, pxPerMm),
    fontSize
  );
  drawInlineRunsAtX(
    ctx,
    [{ text: "no diário eletrônico no site FAESDE" }],
    blockX,
    mmToPx(210.4, pxPerMm),
    fontSize
  );
};

const drawVerificationSeals = async (
  ctx: CanvasRenderingContext2D,
  pxPerMm: number,
  seal: HTMLImageElement,
  abedSeal: HTMLImageElement,
  qrDataUrl: string
) => {
  const qr = await loadImage(qrDataUrl);
  const sealSize = mmToPx(22, pxPerMm);
  const qrSize = mmToPx(23.5, pxPerMm);

  ctx.drawImage(seal, mmToPx(11, pxPerMm), mmToPx(220, pxPerMm), sealSize, sealSize);
  ctx.drawImage(abedSeal, mmToPx(37, pxPerMm), mmToPx(220, pxPerMm), sealSize, sealSize);
  ctx.drawImage(qr, mmToPx(12, pxPerMm), mmToPx(246, pxPerMm), qrSize, qrSize);
};

const drawPageOne = async (
  bg: HTMLImageElement,
  watermark: HTMLImageElement,
  seal: HTMLImageElement,
  abedSeal: HTMLImageElement,
  qrDataUrl: string,
  c: CertificatePdfData & ResolvedCertificateRegistry
) => {
  const { canvas, ctx, pxPerMm } = await createPageCanvas(bg, watermark);
  const bodyX = mmToPx(40, pxPerMm);
  const bodyW = mmToPx(137, pxPerMm);
  const bodyFont = ptToPx(11, pxPerMm);
  const bodyLineHeight = mmToPx(7.0, pxPerMm);
  const formattedCpf = formatCpf(c.cpf);
  const bodyY = mmToPx(92, pxPerMm);

  drawCertificateTitle(ctx, pxPerMm);

  drawInlineRunsAtX(
    ctx,
    [
      { text: "Certificamos para os devidos fins, que " },
      { text: (c.student_name || "").toLocaleUpperCase("pt-BR"), bold: true },
    ],
    bodyX,
    bodyY,
    bodyFont
  );
  drawInlineRunsAtX(
    ctx,
    [
      ...(formattedCpf
        ? ([{ text: "portador(a) do " }, { text: `CPF: ${formattedCpf}`, bold: true }] as Run[])
        : []),
      { text: " concluiu com êxito o curso livre de" },
    ],
    bodyX,
    bodyY + bodyLineHeight,
    bodyFont
  );
  drawTextLine(ctx, "aperfeiçoamento:", bodyX, bodyY + bodyLineHeight * 2, bodyFont);

  drawCourseTitle(ctx, pxPerMm, c.course_name || "");

  drawRunsCanvas(
    ctx,
    [
      { text: "Em" },
      { text: formatDateBR(c.completion_date), bold: true },
      { text: "com carga horária de" },
      { text: `${c.hours} HORAS,`, bold: true },
      {
        text:
          "nos termos do Decreto Presidencial nº 5.154, de 23 de julho de 2004, Art 1º e 3º e de acordo com as normas do Ministério da Educação (MEC) pela resolução CNE nº 04/99, Art 11.",
      },
    ],
    bodyX,
    mmToPx(151.5, pxPerMm),
    bodyW,
    bodyLineHeight,
    "justify",
    bodyFont
  );

  drawTextLine(
    ctx,
    formatDateExtenso(c.completion_date),
    bodyX + bodyW,
    mmToPx(184.5, pxPerMm),
    ptToPx(11, pxPerMm),
    { bold: true, align: "right" }
  );

  drawRegistryBlock(ctx, pxPerMm, c);
  await drawVerificationSeals(ctx, pxPerMm, seal, abedSeal, qrDataUrl);
  drawStudentBlock(ctx, pxPerMm, c);
  drawSignatureBlock(ctx, pxPerMm);

  return canvas;
};

const wrapContentLine = (line: string, limit = 58): string[] => {
  const trimmed = line.trim();
  if (!trimmed) return [];
  if (trimmed.length <= limit) return [trimmed];

  const breakAt = Math.max(trimmed.lastIndexOf(",", limit), trimmed.lastIndexOf(" ", limit));
  if (breakAt <= 20) return [trimmed];

  const head = trimmed.slice(0, breakAt + 1).trim();
  const tail = trimmed.slice(breakAt + 1).trim();
  return [head, ...wrapContentLine(tail, limit)];
};

const splitContentLines = (content: string) => {
  const rawLines = (content || "Conteúdo programático não informado.")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const withoutHeader =
    rawLines[0]?.toLocaleUpperCase("pt-BR") === "CONTEÚDO PROGRAMÁTICO"
      ? rawLines.slice(1)
      : rawLines;

  return withoutHeader
    .map((line) => wrapContentLine(line))
    .flat()
    .filter((line) => line.length > 0);
};

const drawInfoRow = (
  ctx: CanvasRenderingContext2D,
  pxPerMm: number,
  runs: Run[],
  y: number
) =>
  drawRunsCanvas(
    ctx,
    runs,
    mmToPx(28, pxPerMm),
    y,
    mmToPx(154, pxPerMm),
    mmToPx(6.0, pxPerMm),
    "center",
    ptToPx(10, pxPerMm)
  );

const drawPageTwo = async (
  bg: HTMLImageElement,
  watermark: HTMLImageElement,
  c: CertificatePdfData & ResolvedCertificateRegistry
) => {
  const { canvas, ctx, pxPerMm } = await createPageCanvas(bg, watermark);
  ctx.fillStyle = DEFAULT_COLOR;

  const centerX = canvas.width / 2;
  const courseTitle = normalizeCourseName(c.course_name || "");
  let infoY = mmToPx(79, pxPerMm);

  infoY += drawInfoRow(
    ctx,
    pxPerMm,
    [{ text: "Curso:", bold: true }, { text: courseTitle, bold: true }],
    infoY
  );
  infoY += mmToPx(1.2, pxPerMm);
  infoY += drawInfoRow(
    ctx,
    pxPerMm,
    [{ text: "Nome:", bold: true }, { text: toTitleCasePt(c.student_name || ""), bold: true }],
    infoY
  );
  infoY += mmToPx(1.2, pxPerMm);
  infoY += drawInfoRow(
    ctx,
    pxPerMm,
    [{ text: "Carga Horária", bold: true }, { text: `${c.hours} horas`, bold: true }],
    infoY
  );
  infoY += mmToPx(1.2, pxPerMm);
  drawInfoRow(
    ctx,
    pxPerMm,
    [
      { text: "Número do Certificado:", bold: true },
      { text: c.code, bold: true, color: REGISTRY_RED },
    ],
    infoY
  );

  drawTextLine(
    ctx,
    "CONTEÚDO PROGRAMÁTICO",
    centerX,
    mmToPx(128, pxPerMm),
    ptToPx(13, pxPerMm),
    { bold: true, align: "center" }
  );

  const contentLines = splitContentLines(c.content || "Conteúdo programático não informado.");
  const contentFont = ptToPx(10, pxPerMm);
  let contentY = mmToPx(138, pxPerMm);

  contentLines.forEach((line) => {
    drawTextLine(ctx, line, centerX, contentY, contentFont, { align: "center" });
    contentY += mmToPx(6.2, pxPerMm);
  });

  drawSignatureBlock(ctx, pxPerMm);

  return canvas;
};

const canvasToJpegDataUrl = (canvas: HTMLCanvasElement) => canvas.toDataURL("image/jpeg", 0.96);

export async function emitCertificatePdf(c: CertificatePdfData) {
  const resolved = resolveRegistryNumbers(c);
  const data = { ...c, ...resolved };

  const publicUrl = `https://www.faesde.com.br/certificados/${data.code}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 400, margin: 1 });

  const [bg1, bg2, watermark, mecSeal, abedSeal] = await Promise.all([
    loadImage(CERTIFICATE_BG),
    loadImage(CERTIFICATE_BG),
    loadImage(WATERMARK_OVERLAY),
    loadImage(MEC_SEAL),
    loadImage(ABED_SEAL),
  ]);

  const page1 = await drawPageOne(bg1, watermark, mecSeal, abedSeal, qrDataUrl, data);
  const page2 = await drawPageTwo(bg2, watermark, data);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  pdf.addImage(canvasToJpegDataUrl(page1), "JPEG", 0, 0, PW, PH);
  pdf.addPage();
  pdf.addImage(canvasToJpegDataUrl(page2), "JPEG", 0, 0, PW, PH);
  pdf.save(`certificado-${data.code}.pdf`);
}
