const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Customer = require('./Customer');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const StockLog = require('./StockLog');

// Define Relationships

// Category parent-child relationship
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parent_id' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

// Product belongs to Category
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Invoice belongs to Customer
Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Invoice, { foreignKey: 'customer_id', as: 'invoices' });

// InvoiceItem belongs to Invoice and Product
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

InvoiceItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(InvoiceItem, { foreignKey: 'product_id', as: 'invoiceItems' });

// StockLog belongs to Product
StockLog.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(StockLog, { foreignKey: 'product_id', as: 'stockLogs' });

module.exports = {
    User,
    Category,
    Product,
    Customer,
    Invoice,
    InvoiceItem,
    StockLog,
};
