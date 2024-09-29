export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const imageProblem = (file: { contentType?: string; size: number }) => {
  if (!file.contentType || !IMAGE_TYPES.includes(file.contentType)) {
    return "Only PNG, JPEG, GIF or WebP images can be attached";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Images must be 5 MB or smaller";
  }

  return null;
};
