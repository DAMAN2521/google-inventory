const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importProductsExcel } = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

router.use(authMiddleware);

// Post route for uploading product excel
router.post('/products', upload.single('file'), importProductsExcel);

module.exports = router;
