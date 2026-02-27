const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockLog = sequelize.define('StockLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    change_type: {
        type: DataTypes.ENUM('sale', 'edit', 'manual', 'cancel'),
        allowNull: false,
    },
    quantity_changed: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reference_id: { // e.g. Invoice ID
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'stock_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = StockLog;
