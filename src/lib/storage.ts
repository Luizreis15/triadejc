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

export async function resolveDownloadUrl(fileUrl: string): Promise<string> {
  const path = storageObjectPath(fileUrl);
  if (!path) return fileUrl;

  const { data, error } = await supabase.storage.from(PDF_BUCKET).createSignedUrl(path, 120);
  if (error || !data?.signedUrl) return fileUrl;
  return data.signedUrl;
}
