const { Customer } = require('../models');

// Create a customer
const createCustomer = async (req, res) => {
    try {
        const { name, mobile, address } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const customer = await Customer.create({ name, mobile, address });
        res.status(201).json(customer);
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ message: 'Server error creating customer' });
    }
};

// Get all customers
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({ order: [['created_at', 'DESC']] });
        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ message: 'Server error fetching customers' });
    }
};

// Get a single customer by ID
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ message: 'Server error fetching customer' });
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById
};
