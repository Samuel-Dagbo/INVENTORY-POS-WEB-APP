export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

export function isCloudinaryConfigured(): boolean {
  return !!(
    cloudinaryConfig.cloudName &&
    (cloudinaryConfig.uploadPreset || (cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret))
  );
}
