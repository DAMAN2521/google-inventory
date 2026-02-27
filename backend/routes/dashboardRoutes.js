const express = require('express');
const router = express.Router();
const {
    getDashboardData,
    getLowStockReport,
    getTopSellingProducts
} = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getDashboardData); // /api/dashboard
router.get('/reports/low-stock', getLowStockReport);
router.get('/reports/top-selling', getTopSellingProducts);

module.exports = router;
