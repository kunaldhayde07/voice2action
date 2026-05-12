import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/issues');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: any, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: any, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (
  _req: Request,
  file: any,
  cb: FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed!'));
  }
};

// Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    files: 5,
  },
  fileFilter,
});

// Image compression utility
export const compressImage = async (filePath: string): Promise<void> => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const outputPath = filePath.replace(ext, `_compressed${ext}`);

    await sharp(filePath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80, progressive: true })
      .toFile(outputPath);

    // Replace original with compressed
    fs.unlinkSync(filePath);
    fs.renameSync(outputPath, filePath);
  } catch (error) {
    // Continue even if compression fails
    console.error('Image compression failed:', error);
  }
};

// Delete file utility
export const deleteFile = (filePath: string): void => {
  const fullPath = path.join(__dirname, '../../', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};