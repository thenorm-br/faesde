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

export const sanitizeCertificateFileName = (name: string) => {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return base.endsWith(".pdf") ? base : `${base || "certificado"}.pdf`;
};

export const buildCertificateStoragePath = (code: string, fileName: string) => {
  const safeCode = code.replace(/\D/g, "") || "sem-codigo";
  const random = Math.random().toString(36).slice(2, 8);
  return `${safeCode}/${Date.now()}-${random}-${sanitizeCertificateFileName(fileName)}`;
};

export const getCertificateFilePublicUrl = (path?: string | null) => {
  if (!path) return "";
  return supabase.storage.from(CERTIFICATE_FILES_BUCKET).getPublicUrl(path).data.publicUrl;
};
