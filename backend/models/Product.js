const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    purchase_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    selling_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    gst_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        }
    },
    min_stock_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['sku'] },
        { fields: ['name'] },
        { fields: ['brand'] }
    ]
});

module.exports = Product;
