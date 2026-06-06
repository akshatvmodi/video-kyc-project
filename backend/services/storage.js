const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: "ap-south-1" });
const BUCKET = "kyc-documents-469510588722";

async function uploadDocument(sessionId, fileName, fileBuffer, mimeType) {
  const key = `sessions/${sessionId}/documents/${fileName}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  }));
  console.log(`Uploaded document: ${key}`);
  return key;
}

async function uploadRecording(sessionId, fileName, fileBuffer) {
  const key = `sessions/${sessionId}/recordings/${fileName}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: "video/mp4",
  }));
  console.log(`Uploaded recording: ${key}`);
  return key;
}

async function getPresignedUrl(key, expiresIn = 3600) {
  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }), { expiresIn });
  return url;
}

module.exports = { uploadDocument, uploadRecording, getPresignedUrl };
