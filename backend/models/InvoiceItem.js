const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    gst_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    gst_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total: { // Price * quantity + gst_amount
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    tableName: 'invoice_items',
    timestamps: false,
});

module.exports = InvoiceItem;
