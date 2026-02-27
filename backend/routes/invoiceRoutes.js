const express = require('express');
const router = express.Router();
const {
    createInvoice,
    cancelInvoice,
    getInvoices,
    getInvoiceById
} = require('../controllers/invoiceController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/:id/cancel', cancelInvoice);

module.exports = router;
