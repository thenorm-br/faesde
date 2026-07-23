import { supabase } from "@/integrations/supabase/client.ts";

export const CERTIFICATE_FILES_BUCKET = "certificate-files";
export const MAX_CERTIFICATE_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const formatFileSize = (size?: number | null) => {
  if (!size || size <= 0) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
};

const sanitizeFileNamePart = (value: string, maxLength = 60) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " e ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength)
    .replace(/-$/g, "");

export const buildCertificateDownloadFileName = ({
  studentName,
  courseName,
  code,
}: {
  studentName: string;
  courseName: string;
  code: string;
}) => {
  const names = studentName.trim().split(/\s+/).filter(Boolean);
  const firstAndLast =
    names.length > 1 ? `${names[0]}-${names[names.length - 1]}` : names[0] || "Aluno";
  const student = sanitizeFileNamePart(firstAndLast, 50) || "Aluno";
  const course = sanitizeFileNamePart(courseName, 70) || "Curso";
  const safeCode = code.replace(/\D/g, "") || "Sem-Codigo";

  return `Certificado-FAESDE-${student}-${course}-${safeCode}.pdf`;
};

export const buildCertificateStoragePath = (code: string) => {
  const safeCode = code.replace(/\D/g, "") || "sem-codigo";
  return `${safeCode}.pdf`;
};

export const getCertificateFilePublicUrl = (path?: string | null) => {
  if (!path) return "";
  return supabase.storage.from(CERTIFICATE_FILES_BUCKET).getPublicUrl(path).data.publicUrl;
};

export const buildCertificatePdfUrl = (code: string, download = false) =>
  `/api/certificates/${encodeURIComponent(code)}/pdf${download ? "?download=1" : ""}`;
