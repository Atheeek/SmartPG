# 🏠 PG-Pal

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A Commercial-Grade SaaS Platform for PG & Hostel Management**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📋 Overview

**PG-Pal** is a comprehensive, multi-tenant SaaS platform designed to transform how Paying Guest (PG), hostel, and co-living owners manage their business operations. The platform eliminates inefficient manual systems like spreadsheets, WhatsApp groups, and paper records by providing a centralized, automated digital solution for the booming rental accommodation market.

### 🎯 Problem Statement

PG owners face significant operational challenges managing properties manually, including tracking rent payments, maintaining tenant records, calculating expenses, and sending payment reminders. PG-Pal solves these pain points through intelligent automation and professional business management tools.

---

## ✨ Features

### 🔐 Multi-Tenant SaaS Architecture
- **Secure Data Isolation**: Complete data separation for each PG owner using advanced multi-tenant architecture
- **Super Admin Dashboard**: Centralized control panel for managing all client accounts with activation/deactivation capabilities
- **Public Registration**: Self-service sign-up portal for new PG owners

### 💰 Automated Billing & Financials
- **Anniversary-Date Billing**: Intelligent billing system that generates monthly dues based on each tenant's specific joining date
- **Automated SMS Reminders**: Daily cron jobs send rent due reminders and payment confirmations via Twilio integration
- **Expense Tracking**: Comprehensive expense management for utilities, salaries, maintenance, and operational costs
- **Profit & Loss Reports**: Interactive dashboards with visual charts calculating income, expenses, and net profit for any period

### 👥 Complete Tenant Lifecycle Management
- **Smart Onboarding**: Automatic back-filling of historical dues when adding tenants with past joining dates
- **Full CRUD Operations**: Add, Edit, Vacate, Transfer (between rooms), and Delete tenant records
- **Detailed Profiles**: Individual tenant pages displaying complete payment history and stay information
- **Active/Vacated Views**: Filterable directory for managing current and former residents

### 🏢 Advanced Property Management
- **Hierarchical Floor Plans**: Visual layout displaying property structure organized by floor with real-time occupancy status
- **Bulk Setup Wizard**: Rapid configuration tool for setting up multi-floor buildings with rooms and beds in minutes
- **Full Property CRUD**: Complete management of properties, rooms, and individual bed assignments

---

## 🛠 Tech Stack

### Frontend
- **React** (Vite) - Modern UI framework with lightning-fast development experience
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Shadcn/ui** - High-quality accessible component library
- **Recharts** - Data visualization library for financial charts
- **Framer Motion** - Animation library for smooth interactions

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework

### Database
- **MongoDB** - NoSQL database with Mongoose ODM
- Advanced features: Transactions, partial indexes for data integrity

### Integrations
- **Twilio** - SMS notification service for automated reminders

---

## 📁 Project Structure

pg-pal/
├── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components
│ │ ├── services/ # API service layer
│ │ ├── hooks/ # Custom React hooks
│ │ ├── utils/ # Utility functions
│ │ └── App.jsx # Main app component
│ ├── package.json
│ └── vite.config.js
├── backend/ # Node.js + Express backend
│ ├── src/
│ │ ├── controllers/ # Request handlers
│ │ ├── models/ # Mongoose schemas
│ │ ├── routes/ # API routes
│ │ ├── middleware/ # Custom middleware
│ │ ├── services/ # Business logic
│ │ ├── utils/ # Helper functions
│ │ └── server.js # Entry point
│ └── package.json
├── .env.example # Environment variables template
└── README.md


---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- Twilio Account (for SMS functionality)

### Setup Instructions

1. **Clone the repository**

2. cd pg-pal

text

2. **Install dependencies**
Install backend dependencies
cd backend
npm install

Install frontend dependencies
cd ../frontend
npm install

text

3. **Configure environment variables**
Backend (.env)
cd backend
cp .env.example .env

text

Edit `.env` with your configuration:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pgpal
JWT_SECRET=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NODE_ENV=development

text

4. **Start MongoDB**
mongod --dbpath /path/to/your/db

text

5. **Run the application**
Start backend server (from backend directory)
npm run dev

Start frontend development server (from frontend directory)
cd ../frontend
npm run dev

text

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 💻 Usage

### For PG Owners

1. **Registration**: Navigate to the public sign-up page and create your account
2. **Property Setup**: Use the Bulk Add wizard to configure your property structure (floors, rooms, beds)
3. **Add Tenants**: Onboard tenants with their joining dates; the system automatically handles billing
4. **Track Financials**: Log expenses and view real-time profit/loss reports with interactive charts
5. **Automated Reminders**: System automatically sends SMS notifications for rent dues and confirmations

### For Super Admin

1. **Account Management**: View all registered PG owners from the admin dashboard
2. **Account Control**: Activate or deactivate client accounts as needed
3. **Platform Monitoring**: Track overall platform usage and performance

---

## 🏗 Architecture

### Multi-Tenant Data Isolation

PG-Pal implements a **single database, multiple schema** approach for multi-tenancy. Each PG owner's data is completely isolated using MongoDB's document-level security and Mongoose middleware, ensuring no data leakage between tenants.

### Automated Billing System

The anniversary-date billing engine uses cron jobs to:
1. Calculate monthly dues based on individual tenant joining dates
2. Trigger automated SMS reminders via Twilio API
3. Back-fill historical payment records for tenants with past joining dates

### Database Design

- **Transactions**: MongoDB transactions ensure data consistency across tenant operations
- **Partial Indexes**: Optimized queries for active vs. vacated tenant filtering
- **Schema Validation**: Mongoose schemas enforce data integrity at the application level

---

## 🔒 Security

- JWT-based authentication for secure API access
- Data isolation at the tenant level using middleware
- Environment variable protection for sensitive credentials
- Role-based access control (Super Admin vs. PG Owner)

---

## 📊 API Documentation

API endpoints follow RESTful conventions:

/api/auth - Authentication endpoints
/api/tenants - Tenant CRUD operations
/api/properties - Property management
/api/payments - Payment tracking
/api/expenses - Expense logging
/api/reports - Financial reports
/api/admin - Super admin operations

text

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 📧 Contact

For inquiries, please contact: [your-email@example.com]

---

## 🙏 Acknowledgments

- Shadcn/ui for beautiful component primitives
- Recharts for powerful data visualization
- Twilio for reliable SMS delivery
- The open-source community for inspiration and tools

---

<div align="center">
Made with ❤️ for the PG & Hostel Management Industry
</div>
