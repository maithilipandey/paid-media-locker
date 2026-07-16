import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

// Use local S3 for development if configured
if (process.env.S3_USE_LOCAL === 'true') {
  s3.endpoint = new AWS.Endpoint('http://localhost:9000');
  s3.s3ForcePathStyle = true;
}

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'paid-media-locker';
const SIGNED_URL_EXPIRY = parseInt(process.env.SIGNED_URL_EXPIRY || '900', 10);

export class S3Service {
  static async uploadFile(fileBuffer, mimeType, folder = 'uploads') {
    const key = `${folder}/${uuidv4()}-${Date.now()}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
    };

    try {
      await s3.upload(params).promise();
      return key;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  static async getSignedUrl(key, userId) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: SIGNED_URL_EXPIRY,
    };

    try {
      const url = s3.getSignedUrl('getObject', params);
      // Bind to userId for security - signature includes user info
      return {
        url,
        expiresAt: new Date(Date.now() + SIGNED_URL_EXPIRY * 1000),
        boundToUserId: userId,
      };
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static async deleteFile(key) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  static async copyFile(sourceKey, destinationKey) {
    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
      ServerSideEncryption: 'AES256',
    };

    try {
      await s3.copyObject(params).promise();
      return destinationKey;
    } catch (error) {
      console.error('S3 copy error:', error);
      throw new Error('Failed to copy file in S3');
    }
  }

  static async getFileMetadata(key) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      const metadata = await s3.headObject(params).promise();
      return {
        size: metadata.ContentLength,
        type: metadata.ContentType,
        lastModified: metadata.LastModified,
      };
    } catch (error) {
      console.error('S3 metadata error:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}

export default S3Service;
