const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, getCustomerById } = require('../controllers/customerController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);

module.exports = router;
