const { Product, Invoice, InvoiceItem, Category, Customer } = require('../models');
const { Op } = require('sequelize');

// Dashboard Overview
const getDashboardData = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Today's Sales
        const todayInvoices = await Invoice.findAll({
            where: {
                created_at: { [Op.gte]: today },
                status: 'active'
            }
        });
        const todaysSales = todayInvoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total), 0);

        // Monthly Sales
        const monthInvoices = await Invoice.findAll({
            where: {
                created_at: { [Op.gte]: startOfMonth },
                status: 'active'
            }
        });
        const monthlySales = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total), 0);

        // Total Products
        const totalProducts = await Product.count();

        // Low Stock Products Count
        const products = await Product.findAll();
        const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_level).length;

        // Recent Invoices
        const recentInvoices = await Invoice.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{ model: Customer, as: 'customer' }]
        });

        res.json({
            todaysSales,
            monthlySales,
            totalProducts,
            lowStockCount,
            recentInvoices
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
};

// Reports

// Get Low Stock Products List
const getLowStockReport = async (req, res) => {
    try {
        const products = await Product.findAll();
        const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_level);
        res.json(lowStock);
    } catch (error) {
        console.error('Low stock report error:', error);
        res.status(500).json({ message: 'Server error fetching low stock report' });
    }
};

// Top Selling Products
const getTopSellingProducts = async (req, res) => {
    try {
        const items = await InvoiceItem.findAll({
            include: [
                { model: Invoice, as: 'invoice', where: { status: 'active' } },
                { model: Product, as: 'product' }
            ]
        });

        const productSales = {};

        items.forEach(item => {
            const pid = item.product_id;
            if (!productSales[pid]) {
                productSales[pid] = {
                    product: item.product,
                    totalQty: 0,
                    totalRevenue: 0
                };
            }
            productSales[pid].totalQty += item.quantity;
            productSales[pid].totalRevenue += parseFloat(item.total);
        });

        // Sort by qty and take top 10
        const topSelling = Object.values(productSales)
            .sort((a, b) => b.totalQty - a.totalQty)
            .slice(0, 10);

        res.json(topSelling);
    } catch (error) {
        console.error('Top selling error:', error);
        res.status(500).json({ message: 'Server error fetching top selling report' });
    }
};


module.exports = {
    getDashboardData,
    getLowStockReport,
    getTopSellingProducts
};
