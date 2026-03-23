import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Build the R2 object key for a resume.
 * Format: resumes/{userId}/{resumeId}.pdf
 */
function buildKey(userId: string, resumeId: string): string {
  return `resumes/${userId}/${resumeId}.pdf`;
}

/**
 * Upload a PDF resume to R2.
 * Returns the object key stored in the bucket.
 */
export async function uploadResume(
  userId: string,
  resumeId: string,
  file: Buffer,
  displayName: string
): Promise<string> {
  const key = buildKey(userId, resumeId);

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${displayName}.pdf"`,
    })
  );

  return key;
}

/**
 * Get a resume PDF as a readable stream for inline viewing or download.
 */
export async function getResume(r2Key: string) {
  const response = await r2.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
    })
  );

  return {
    body: response.Body,
    contentType: response.ContentType,
    contentDisposition: response.ContentDisposition,
    contentLength: response.ContentLength,
  };
}

/**
 * Generate a pre-signed URL for direct browser access to a resume PDF.
 * Defaults to 1 hour expiry.
 */
export async function getResumeUrl(
  r2Key: string,
  expiresIn: number = 3600
): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
    }),
    { expiresIn }
  );
}

/**
 * Generate a pre-signed upload URL so the client can PUT directly to R2.
 * Defaults to 10 minute expiry.
 */
export async function getUploadUrl(
  userId: string,
  resumeId: string,
  displayName: string,
  expiresIn: number = 600
): Promise<{ url: string; key: string }> {
  const key = buildKey(userId, resumeId);

  const url = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${displayName}.pdf"`,
    }),
    { expiresIn }
  );

  return { url, key };
}

/**
 * Delete a resume PDF from R2.
 */
export async function deleteResume(r2Key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
    })
  );
}

/**
 * Check if a resume PDF exists in R2.
 */
export async function resumeExists(r2Key: string): Promise<boolean> {
  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: r2Key,
      })
    );
    return true;
  } catch {
    return false;
  }
}
