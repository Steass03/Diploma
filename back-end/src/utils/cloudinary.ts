import { v2 as cloudinary } from "cloudinary";
import stream from "node:stream";

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn("⚠️ Missing Cloudinary env vars");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type ResourceType = "image" | "raw";

/**
 * Upload an in-memory file buffer to Cloudinary.
 * @param file Multer file (buffered)
 * @param folder Cloudinary folder (e.g., "users/images", "users/cv")
 * @param resource_type "image" for avatars; "raw" for PDFs/DOCs/ZIPs
 */
export function uploadBufferToCloudinary(
  file: Express.Multer.File,
  folder: string,
  resource_type: ResourceType
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const passthrough = new stream.PassThrough();
    const upload = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve({ url: result.secure_url!, public_id: result.public_id! });
      }
    );
    passthrough.end(file.buffer);
    passthrough.pipe(upload);
  });
}
