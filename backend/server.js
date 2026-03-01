const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const sequelize = require('./config/database');
const { User, Category, Product, Customer, Invoice, InvoiceItem, StockLog } = require('./models');

// Import routes (we will create these later)
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
}));
app.use(cors({
    origin: '*', // We'll update this once the frontend is deployed
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Sync models
        await sequelize.sync();
        console.log('Database synchronized');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
