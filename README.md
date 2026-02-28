# Google Inventory System

A full-stack, comprehensive Inventory Management System developed to track products, categories, stock levels, and invoices. 

## 🛠️ Tech Stack

**Frontend:**
- React (built with Vite)
- JavaScript

**Backend:**
- Node.js & Express
- Sequelize ORM
- Multer & xlsx (for Excel file data imports)

**Database:**
- SQLite (Configured for local development storage)

## ✨ Key Features

- **User Authentication:** Role-based access control (Admin & Staff).
- **Product & Category Management:** Create and organize products within nested categories.
- **Stock Tracking:** Automatic stock logging and minimum stock alerts.
- **Invoicing & Sales:** Generate customer invoices and automatically deduct from inventory stock.
- **Bulk Excel Import:** Upload `.xlsx` spreadsheets to rapidly add products to the database in bulk without duplicates.

## 🚀 Running Locally (Localhost)

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/DAMAN2521/google-inventory.git
cd "inventory system new"
```

### 2. Setup the Backend
Open a terminal and run the following commands to install dependencies and start the backend server.
```bash
cd backend
npm install
npm run dev 
# (or 'npm start' / 'node index.js' depending on your package.json script)
```
*Note: The backend runs using an SQLite database (`inventory.sqlite`). A local file will automatically be created when the server starts.*

### 3. Setup the Frontend
Open a **new, separate terminal window** and run the following commands for the React frontend.
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
Once both servers are running:
- Open your browser and go to the URL provided by Vite (usually **http://localhost:5173**)
- The backend API usually listens on **http://localhost:5000** (or whatever port is defined in your backend files).

---

## 🔒 Deployment Notes (Future)
Currently, this app is configured to use **SQLite** which stores data in a local file. Before deploying to production platforms (like Vercel, Render, or Heroku), the database configuration in `backend/config/database.js` should be updated to a persistent database like **PostgreSQL** or **MySQL** so that data is not lost when the cloud server restarts.
