const { Invoice, InvoiceItem, Product, StockLog, Customer } = require('../models');
const sequelize = require('../config/database');

const generateInvoiceNumber = async () => {
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    // Find latest invoice for today
    const lastInvoice = await Invoice.findOne({
        where: {
            invoice_number: {
                [sequelize.Sequelize.Op.like]: `INV-${dateString}-%`
            }
        },
        order: [['created_at', 'DESC']]
    });

    let seq = 1;
    if (lastInvoice) {
        const parts = lastInvoice.invoice_number.split('-');
        seq = parseInt(parts[2], 10) + 1;
    }

    const seqString = seq.toString().padStart(4, '0');
    return `INV-${dateString}-${seqString}`;
};

// Create a new invoice
const createInvoice = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { customer_id, items, discount = 0 } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Invoice must contain at least one item' });
        }

        let subtotal = 0;
        let total_gst = 0;
        const processedItems = [];

        // 1. Process items and validate stock
        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });

            if (!product) {
                throw new Error(`Product with ID ${item.product_id} not found`);
            }

            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}`);
            }

            // Calculate totals
            const price = parseFloat(product.selling_price);
            const qty = parseInt(item.quantity, 10);
            const gstPercent = parseFloat(product.gst_percent);

            const itemSubtotal = price * qty;
            const gstAmount = (itemSubtotal * gstPercent) / 100;
            const itemTotal = itemSubtotal + gstAmount;

            subtotal += itemSubtotal;
            total_gst += gstAmount;

            processedItems.push({
                product_id: product.id,
                quantity: qty,
                price,
                gst_percent: gstPercent,
                gst_amount: gstAmount,
                total: itemTotal,
                productInstance: product
            });
        }

        const grand_total = subtotal + total_gst - parseFloat(discount);
        const invoice_number = await generateInvoiceNumber();

        // 2. Create Invoice
        const invoice = await Invoice.create({
            invoice_number,
            customer_id: customer_id || null,
            subtotal,
            total_gst,
            discount,
            grand_total,
            status: 'active'
        }, { transaction: t });

        // 3. Create Items, Stock Logs, and Update Stock
        for (const pItem of processedItems) {
            // Create Invoice Item
            await InvoiceItem.create({
                invoice_id: invoice.id,
                product_id: pItem.product_id,
                quantity: pItem.quantity,
                price: pItem.price,
                gst_percent: pItem.gst_percent,
                gst_amount: pItem.gst_amount,
                total: pItem.total
            }, { transaction: t });

            // Update Stock
            await pItem.productInstance.update({
                stock_quantity: pItem.productInstance.stock_quantity - pItem.quantity
            }, { transaction: t });

            // Create Stock Log
            await StockLog.create({
                product_id: pItem.product_id,
                change_type: 'sale',
                quantity_changed: -pItem.quantity,
                reference_id: invoice.id
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(invoice);

    } catch (error) {
        await t.rollback();
        console.error('Invoice creation error:', error);
        res.status(400).json({ message: error.message || 'Error creating invoice' });
    }
};

// Cancel Invoice
const cancelInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id, {
            include: [{ model: InvoiceItem, as: 'items' }],
            transaction: t
        });

        if (!invoice) throw new Error('Invoice not found');
        if (invoice.status === 'cancelled') throw new Error('Invoice is already cancelled');

        await invoice.update({ status: 'cancelled' }, { transaction: t });

        // Restore stock and log
        for (const item of invoice.items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });

            if (product) {
                await product.update({
                    stock_quantity: product.stock_quantity + item.quantity
                }, { transaction: t });

                await StockLog.create({
                    product_id: item.product_id,
                    change_type: 'cancel',
                    quantity_changed: item.quantity,
                    reference_id: invoice.id
                }, { transaction: t });
            }
        }

        await t.commit();
        res.json({ message: 'Invoice cancelled successfully', invoice });

    } catch (error) {
        await t.rollback();
        console.error('Invoice cancellation error:', error);
        res.status(400).json({ message: error.message || 'Error cancelling invoice' });
    }
};

// Get Invoices
const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                { model: Customer, as: 'customer' }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ message: 'Server error fetching invoices' });
    }
};

// Get Single Invoice
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                { model: Customer, as: 'customer' },
                {
                    model: InvoiceItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ message: 'Server error fetching invoice' });
    }
};

module.exports = {
    createInvoice,
    cancelInvoice,
    getInvoices,
    getInvoiceById
};
