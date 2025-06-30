import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

// Configure DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || 'nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || 'astora-inspections';

export async function uploadToSpaces(file: Express.Multer.File): Promise<string> {
  try {
    const fileContent = fs.readFileSync(file.path);
    const fileName = `inspections/${Date.now()}-${file.originalname}`;
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    const result = await s3.upload(uploadParams).promise();
    
    // Clean up temporary file
    fs.unlinkSync(file.path);
    
    return result.Location;
  } catch (error) {
    console.error('Upload to Spaces error:', error);
    throw new Error('Failed to upload file to DigitalOcean Spaces');
  }
}

export async function uploadReportToSpaces(filePath: string, fileName: string): Promise<string> {
  try {
    const fileContent = fs.readFileSync(filePath);
    const key = `reports/${fileName}`;
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const result = await s3.upload(uploadParams).promise();
    
    // Clean up temporary file
    fs.unlinkSync(filePath);
    
    return result.Location;
  } catch (error) {
    console.error('Upload report error:', error);
    throw new Error('Failed to upload report to DigitalOcean Spaces');
  }
}
