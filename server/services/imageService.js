import sharp from 'sharp';
import S3Service from './s3Service.js';

export class ImageService {
  static async processImage(fileBuffer, mimeType) {
    try {
      // Validate it's an image
      if (!mimeType.startsWith('image/')) {
        throw new Error('File is not an image');
      }

      const image = sharp(fileBuffer);
      const metadata = await image.metadata();

      // Generate thumbnail (200x200)
      const thumbnail = await image
        .resize(200, 200, {
          fit: 'cover',
          position: 'center',
        })
        .toBuffer();

      // Generate preview (800x600)
      const preview = await sharp(fileBuffer)
        .resize(800, 600, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      return {
        thumbnail,
        preview,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
        },
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  static async uploadProcessedImages(
    originalBuffer,
    mimeType,
    mediaId,
  ) {
    try {
      // Process original image
      const { thumbnail, preview, metadata } = await this.processImage(
        originalBuffer,
        mimeType,
      );

      // Upload to S3
      const originalKey = await S3Service.uploadFile(
        originalBuffer,
        mimeType,
        `media/${mediaId}/original`,
      );

      const thumbnailKey = await S3Service.uploadFile(
        thumbnail,
        'image/jpeg',
        `media/${mediaId}/thumbnails`,
      );

      const previewKey = await S3Service.uploadFile(
        preview,
        'image/jpeg',
        `media/${mediaId}/previews`,
      );

      return {
        originalKey,
        thumbnailKey,
        previewKey,
        metadata,
      };
    } catch (error) {
      console.error('Failed to upload processed images:', error);
      throw error;
    }
  }
}

export default ImageService;
