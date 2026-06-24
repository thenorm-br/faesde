import html2canvas from "html2canvas";
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

// A4 @ 96dpi
const W = 794;
const H = 1123;

const bgStyle = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;`;

const buildPage1Html = (c: CertificatePdfData, qrDataUrl: string) => {
  const nomeUpper = (c.student_name || "").toLocaleUpperCase("pt-BR");
  const nomeTitle = toTitleCasePt(c.student_name);
  const cursoTitle = toTitleCasePt(c.course_name);
  const extenso = formatDateExtenso(c.completion_date);
  const dataBR = formatDateBR(c.completion_date);

  return `
    <div style="position:relative;width:${W}px;height:${H}px;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a;overflow:hidden;">
      <img src="/certificado/image7.png" style="${bgStyle}" crossorigin="anonymous" />
      <div style="position:absolute;inset:0;z-index:1;padding:170px 90px 90px 90px;box-sizing:border-box;display:flex;flex-direction:column;">
        <h1 style="font-size:54px;font-weight:800;margin:0 0 6px 0;letter-spacing:0.5px;color:#0a1a40;">Certificamos</h1>
        <p style="font-size:15px;margin:14px 0 0 0;line-height:1.55;text-align:justify;">
          que <strong style="text-transform:uppercase;">${nomeUpper}</strong>${
    c.cpf ? `, portador(a) do CPF <strong>${c.cpf}</strong>,` : ","
  } concluiu com êxito o curso livre de aperfeiçoamento:
        </p>
        <h2 style="font-size:26px;font-weight:700;margin:22px 0 0 0;color:#0a1a40;text-align:center;">${cursoTitle}</h2>
        <p style="font-size:15px;margin:22px 0 0 0;line-height:1.55;text-align:justify;">
          Com carga horária de <strong>${c.hours} horas</strong>, concluído em <strong>${dataBR}</strong>, nos termos do Decreto Presidencial nº 5.154, de 23 de julho de 2004, Art 1º e 3º e de acordo com as normas do Ministério da Educação (MEC) pela resolução CNE nº 04/99, Art 11.
        </p>
        <p style="font-size:13px;margin:18px 0 0 0;line-height:1.55;text-align:justify;text-transform:uppercase;">
          O presente documento foi registrado sob o número <strong>${c.code}</strong>${
    c.page_number ? `, em folha <strong>${c.page_number}</strong>` : ""
  }${c.book_number ? ` do livro nº <strong>${c.book_number}</strong>` : ""} desta instituição de ensino.
        </p>

        <div style="margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <img src="${qrDataUrl}" style="width:110px;height:110px;" />
            <div style="display:flex;gap:8px;align-items:center;">
              <img src="/certificado/image5.png" style="width:64px;height:auto;" crossorigin="anonymous" />
              <img src="/certificado/image4.jpeg" style="width:64px;height:auto;" crossorigin="anonymous" />
            </div>
          </div>
          <div style="text-align:center;flex:1;">
            <p style="font-size:13px;margin:0;line-height:1.4;">${extenso}</p>
            <div style="margin-top:30px;display:flex;flex-direction:column;align-items:center;">
              <img src="/certificado/image3.png" style="width:230px;height:auto;" crossorigin="anonymous" />
              <div style="border-top:1px solid #000;width:260px;margin-top:-6px;padding-top:4px;font-size:12px;line-height:1.35;">
                Cleide Divino Silva Santos<br/>
                Diretor(a) – Faesde EAD<br/>
                CNPJ: 21.819.091/0001-61
              </div>
            </div>
          </div>
          <div style="width:120px;"></div>
        </div>
      </div>
    </div>
  `;
};

const buildPage2Html = (c: CertificatePdfData) => {
  const nomeTitle = toTitleCasePt(c.student_name);
  const cursoTitle = toTitleCasePt(c.course_name);
  const conteudo = (c.content || "").trim() || "Conteúdo programático não informado.";

  return `
    <div style="position:relative;width:${W}px;height:${H}px;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a;overflow:hidden;">
      <img src="/certificado/image7.png" style="${bgStyle}" crossorigin="anonymous" />
      <div style="position:absolute;inset:0;z-index:1;padding:200px 100px 110px 100px;box-sizing:border-box;display:flex;flex-direction:column;">
        <div style="font-size:14px;line-height:1.7;">
          <div><strong>Curso:</strong> ${cursoTitle}</div>
          <div><strong>Nome:</strong> ${nomeTitle}</div>
          <div><strong>Carga Horária:</strong> ${c.hours} horas</div>
          <div><strong>Número do Certificado:</strong> <span style="color:#c0392b;">${c.code}</span></div>
        </div>
        <h2 style="text-align:center;margin:28px 0 14px 0;font-size:18px;letter-spacing:1px;">CONTEÚDO PROGRAMÁTICO</h2>
        <div style="font-size:13px;line-height:1.65;white-space:pre-wrap;text-align:justify;flex:1;">${conteudo.replace(/[<>]/g, "")}</div>

        <div style="margin-top:auto;text-align:center;">
          <img src="/certificado/image3.png" style="width:230px;height:auto;" crossorigin="anonymous" />
          <div style="border-top:1px solid #000;width:260px;margin:-6px auto 0 auto;padding-top:4px;font-size:12px;line-height:1.35;">
            Cleide Divino Silva Santos<br/>
            Diretor(a) – Faesde EAD<br/>
            CNPJ: 21.819.091/0001-61
          </div>
        </div>
      </div>
    </div>
  `;
};

const waitImages = (root: HTMLElement) =>
  Promise.all(
    Array.from(root.querySelectorAll("img")).map(
      (img) =>
        new Promise<void>((resolve) => {
          if ((img as HTMLImageElement).complete) resolve();
          else {
            img.addEventListener("load", () => resolve());
            img.addEventListener("error", () => resolve());
          }
        })
    )
  );

export async function emitCertificatePdf(c: CertificatePdfData) {
  const publicUrl = `https://www.faesde.com.br/certificados/${c.code}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 300, margin: 1 });

  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-99999px;top:0;width:${W}px;height:${H * 2 + 40}px;`;
  host.innerHTML = `
    <div data-page="1">${buildPage1Html(c, qrDataUrl)}</div>
    <div data-page="2" style="margin-top:40px;">${buildPage2Html(c)}</div>
  `;
  document.body.appendChild(host);

  try {
    await waitImages(host);
    await new Promise((r) => setTimeout(r, 100));

    const page1El = host.querySelector('[data-page="1"]') as HTMLElement;
    const page2El = host.querySelector('[data-page="2"]') as HTMLElement;

    const opts = { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false };
    const canvas1 = await html2canvas(page1El, opts);
    const canvas2 = await html2canvas(page2El, opts);

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    pdf.addImage(canvas1.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageW, pageH);
    pdf.addPage();
    pdf.addImage(canvas2.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageW, pageH);

    pdf.save(`certificado-${c.code}.pdf`);
  } finally {
    document.body.removeChild(host);
  }
}
