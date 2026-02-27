const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { User, Category, Product } = require('../models');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Force sync for fresh start (uncomment if you want to wipe DB each seed)
        await sequelize.sync({ alter: true });

        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const password_hash = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password_hash,
                role: 'admin',
            });
            console.log('Admin user created (admin / admin123)');
        }

        // Checking if categories exist
        const categoryCount = await Category.count();
        if (categoryCount === 0) {
            const elec = await Category.create({ name: 'Electronics' });
            const spares = await Category.create({ name: 'Spare Parts' });

            const p1 = await Product.create({
                sku: 'SKU-ELEC-001',
                name: 'Multimeter Pro',
                category_id: elec.id,
                brand: 'Fluke',
                purchase_price: 15.00,
                selling_price: 25.00,
                gst_percent: 18.00,
                stock_quantity: 50,
                min_stock_level: 10,
            });

            const p2 = await Product.create({
                sku: 'SKU-SPARE-002',
                name: 'Brake Pads Set',
                category_id: spares.id,
                brand: 'Bosch',
                purchase_price: 40.00,
                selling_price: 65.00,
                gst_percent: 18.00,
                stock_quantity: 20,
                min_stock_level: 5,
            });
            console.log('Sample categories and products seeded.');
        } else {
            console.log('Data already seeded earlier.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
