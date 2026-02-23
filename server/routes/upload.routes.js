
import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { uploadReviewImage } from '../controllers/upload.controller.js';

const router = express.Router();



const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
        }
    }
});

router.use(authenticateToken);


router.post('/review', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
           
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
           
            return res.status(400).json({ message: err.message });
        }
       
        next();
    });
}, uploadReviewImage);

export default router;