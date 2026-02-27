const xlsx = require('xlsx');
const { Product } = require('../models');

const importProductsExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Read the file from buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        let addedCount = 0;
        let skippedCount = 0;
        const errors = [];

        // Fetch existing SKUs to avoid UniqueConstraint errors
        const existingProducts = await Product.findAll({ attributes: ['sku'] });
        const existingSkus = new Set(existingProducts.map(p => p.sku));

        for (const row of data) {
            const product = {
                name: row["Name"]?.toString()?.trim(),
                sku: row["SKU"]?.toString()?.trim(),
                purchasePrice: Number(row["Purchase Price"]),
                sellingPrice: Number(row["Selling Price"]),
                brand: row["Brand"]?.toString()?.trim() || "",
                categoryId: parseInt(row["Category ID"]) || 1,
                gst: parseFloat(row["GST %"]) || 0,
                stock: parseInt(row["Stock Quantity"]) || 0,
                minStock: parseInt(row["Min Stock Level"]) || 5,
            };

            // Basic validation
            if (!product.sku || !product.name || isNaN(product.purchasePrice) || isNaN(product.sellingPrice)) {
                skippedCount++;
                errors.push(`Row missing required fields or invalid prices (SKU: ${product.sku || 'Unknown'})`);
                continue;
            }

            // Check duplicate
            if (existingSkus.has(product.sku)) {
                skippedCount++;
                errors.push(`SKU ${product.sku} already exists. Skipped.`);
                continue;
            }

            // Create
            try {
                await Product.create({
                    sku: product.sku,
                    name: product.name,
                    category_id: product.categoryId,
                    brand: product.brand,
                    purchase_price: product.purchasePrice,
                    selling_price: product.sellingPrice,
                    gst_percent: product.gst,
                    stock_quantity: product.stock,
                    min_stock_level: product.minStock
                });

                existingSkus.add(product.sku); // Prevent duplicates within the same file
                addedCount++;
            } catch (err) {
                skippedCount++;
                errors.push(`Error inserting SKU ${product.sku}: ${err.message}`);
            }
        }

        res.json({
            message: `Import complete. Added ${addedCount} products. Skipped ${skippedCount}.`,
            addedCount,
            skippedCount,
            errors
        });

    } catch (error) {
        console.error('Excel import error:', error);
        res.status(500).json({ message: 'Server error during import' });
    }
};

module.exports = {
    importProductsExcel
};
