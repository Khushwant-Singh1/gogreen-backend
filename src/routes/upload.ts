import { Router, type IRouter, type Request, type Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import s3Client from '../services/s3Client.js';
import { authenticateToken, requireEditor } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Ensure AWS configuration is present
const bucketName = process.env.AWS_S3_BUCKET_NAME;
if (!bucketName) {
  console.warn('AWS_S3_BUCKET_NAME is not defined. Uploads may fail.');
}

const storage = multerS3({
  s3: s3Client,
  bucket: bucketName || '',
  // acl: 'public-read', // Commented out to avoid AccessDenied if ACLs are disabled. Ensure bucket policy allows access.
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'uploads/' + 'image-' + uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only specific image and pdf files are allowed!'));
  }
});

router.post('/', authenticateToken, requireEditor, upload.single('file'), (req: Request, res: Response) => {
  console.log('Upload Request Headers:', req.headers);
  console.log('Upload Request File:', req.file);
  console.log('Upload Request Body:', req.body);
  
    if (!req.file) {
    console.error('No file in request');
    res.status(400).json({ 
      error: 'No file uploaded',
      receivedContentType: req.headers['content-type'],
      receivedLength: req.headers['content-length']
    });
    return;
  }
  
  // Use necessary type assertion for multer-s3 properties
  const fileKey = (req.file as any).key;
  const location = (req.file as any).location;

  // Return CloudFront URL if configured, otherwise S3 URL
  let url = location;
  if (process.env.CLOUDFRONT_DOMAIN) {
    url = `https://${process.env.CLOUDFRONT_DOMAIN}/${fileKey}`;
  }

  res.json({ url });
});

export default router;
