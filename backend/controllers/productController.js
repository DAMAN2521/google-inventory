const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// Add a new product
const createProduct = async (req, res) => {
    try {
        const { sku, name, category_id, brand, purchase_price, selling_price, gst_percent, stock_quantity, min_stock_level } = req.body;

        // Minimal validation
        if (!sku || !name || !category_id || !purchase_price || !selling_price) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const product = await Product.create({
            sku,
            name,
            category_id,
            brand,
            purchase_price,
            selling_price,
            gst_percent,
            stock_quantity,
            min_stock_level
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'SKU already exists' });
        }
        res.status(500).json({ message: 'Server error creating product' });
    }
};

// Edit a product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.update(req.body);
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

// View product list
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, as: 'category' }],
            order: [['created_at', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

// Smart Search Endpoint (MVP 4 requirement embedded)
const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { sku: { [Op.like]: `%${q}%` } }, // Use Like for sqlite, standard is iLike for postgres
                    { name: { [Op.like]: `%${q}%` } },
                    { brand: { [Op.like]: `%${q}%` } }
                ]
            },
            limit: 20
        });

        res.json(products);
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ message: 'Server error searching products' });
    }
};


module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    searchProducts
};
