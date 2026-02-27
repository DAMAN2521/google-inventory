require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Connecting to database:', process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'inventory_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'postgres',
  {
    dialect: 'sqlite',
    storage: './inventory.sqlite',
    logging: false, // Set to console.log to see SQL queries
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
};

testConnection();

module.exports = sequelize;
