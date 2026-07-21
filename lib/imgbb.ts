// ImgBB upload helper. When NEXT_PUBLIC_IMGBB_KEY is not set (mock mode),
// forms fall back to a plain URL input — see components/forms/ImageUploader.tsx.

const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY;

export const isImgbbConfigured = Boolean(IMGBB_KEY);

interface ImgBBResponse {
  success: boolean;
  data?: { url: string };
}

export async function uploadToImgBB(file: File): Promise<string> {
  if (!IMGBB_KEY) {
    throw new Error("ImgBB is not configured — set NEXT_PUBLIC_IMGBB_KEY");
  }
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Image upload failed (${res.status})`);
  }
  const json = (await res.json()) as ImgBBResponse;
  if (!json.success || !json.data?.url) {
    throw new Error("Image upload failed — ImgBB did not return a URL");
  }
  return json.data.url;
}
