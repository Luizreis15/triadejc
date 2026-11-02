import { supabase } from "@/integrations/supabase/client";

const PDF_BUCKET = "pdfs";

export function storageObjectPath(fileUrl: string, bucket = PDF_BUCKET): string | null {
  try {
    const parsed = new URL(fileUrl);
    const markers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ];
    for (const marker of markers) {
      const index = parsed.pathname.indexOf(marker);
      if (index >= 0) {
        return decodeURIComponent(parsed.pathname.slice(index + marker.length));
      }
    }
    return null;
  } catch {
    return null;
  }
}

export class DownloadUrlError extends Error {
  constructor(message = "Não foi possível preparar o arquivo.") {
    super(message);
    this.name = "DownloadUrlError";
  }
}

function isPdfsBucketUrl(fileUrl: string): boolean {
  try {
    const pathname = new URL(fileUrl).pathname;
    return pathname.includes("/storage/v1/object/") && pathname.includes(`/${PDF_BUCKET}/`);
  } catch {
    return false;
  }
}

export async function resolveDownloadUrl(fileUrl: string): Promise<string> {
  const path = storageObjectPath(fileUrl);
  if (!path) {
    if (isPdfsBucketUrl(fileUrl)) {
      throw new DownloadUrlError("O endereço deste PDF não pôde ser lido.");
    }
    return fileUrl;
  }

  const { data, error } = await supabase.storage.from(PDF_BUCKET).createSignedUrl(path, 120);
  if (error || !data?.signedUrl) {
    console.error("resolveDownloadUrl failed", error?.message ?? "missing signed url");
    throw new DownloadUrlError("Não foi possível abrir este PDF. Tente de novo ou fale com o suporte.");
  }
  return data.signedUrl;
}
