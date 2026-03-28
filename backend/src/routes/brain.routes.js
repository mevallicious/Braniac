import express from 'express';
import multer from 'multer';
import { saveContent, searchContent, brainChat , getHistory , deleteMemory , uploadFile ,saveLink} from '../controllers/brain.controller.js';
import { protect } from '../middleware/auth.middleware.js'; 
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


router.post('/upload', protect, upload.single('file'), uploadFile);
router.post('/save-link', protect, saveLink);
router.post('/save', protect, saveContent);

router.get('/history', protect, getHistory); 
router.get('/search', protect, searchContent);
router.post('/chat/:id', protect, brainChat);

router.delete('/:id', protect, deleteMemory);

export default router;