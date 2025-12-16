import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const upload = multer({ storage: multer.memoryStorage() });

function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resource_type: "image" | "raw" = "image",
  originalFilename?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a clean public_id from the original filename
    let publicId: string | undefined;
    if (originalFilename) {
      // Remove extension and sanitize filename
      const nameWithoutExt = originalFilename
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 100); // Limit length
      // Add timestamp to ensure uniqueness
      const timestamp = Date.now();
      publicId = `${folder}/${nameWithoutExt}_${timestamp}`;
    }

    const uploadOptions: any = {
      folder,
      resource_type,
    };

    // For raw files (PDFs), add flags to ensure proper download behavior
    if (resource_type === "raw" && originalFilename) {
      uploadOptions.public_id = publicId;
      // Add filename override to preserve original filename on download
      uploadOptions.filename_override = originalFilename;
    } else if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (err, result) => {
        if (err || !result) return reject(err);
        // For PDFs, modify URL to force download with proper filename
        let url = result.secure_url;
        if (resource_type === "raw" && originalFilename) {
          // Cloudinary URL format: https://res.cloudinary.com/cloud/raw/upload/v123/folder/filename.pdf
          // Insert fl_attachment transformation to force download with proper filename
          // Format: /upload/fl_attachment:filename/v123/folder/file.pdf
          const urlParts = url.split("/upload/");
          if (urlParts.length === 2) {
            // Sanitize filename for URL (remove special chars that might break URL)
            const safeFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
            // Insert transformation: fl_attachment forces download with filename
            url = `${urlParts[0]}/upload/fl_attachment:${safeFilename}/${urlParts[1]}`;
          }
        }
        resolve(url);
      }
    );
    stream.end(buffer);
  });
}

export const uploadUserAssets = [
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 10 },
  ]),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const files = req.files as
        | { [field: string]: Express.Multer.File[] }
        | undefined;

      if (files?.image?.[0]) {
        (req as any).uploadedImageUrl = await uploadToCloudinary(
          files.image[0].buffer,
          "users/images",
          "image",
          files.image[0].originalname
        );
      }

      const cvUrls: string[] = [];
      if (files?.cv?.length) {
        for (const f of files.cv) {
          const url = await uploadToCloudinary(
            f.buffer,
            "users/cv",
            "raw",
            f.originalname
          );
          cvUrls.push(url);
        }
      }
      (req as any).uploadedCvUrls = cvUrls;

      next();
    } catch (e) {
      next(e);
    }
  },
];
