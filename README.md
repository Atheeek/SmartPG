# PG-Pal 🏢

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-%2361DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-%23339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-4A90E2?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-%2306B6D4?logo=tailwind-css)

PG-Pal is a full-stack, commercial-grade Software as a Service (SaaS) platform designed for Paying Guest (PG), hostel, and co-living owners to automate and professionalize their entire business operations.

***
> **Note:** Replace the image link below with a real screenshot or GIF of your application's dashboard.

![PG-Pal Dashboard Mockup]([https://i.imgur.com/example-link.png]) 

***

## 🎯 The Problem

In booming rental markets, owners of PGs, hostels, and co-living spaces often rely on inefficient, error-prone manual systems. Operations are typically managed with a patchwork of spreadsheets, countless WhatsApp groups, and paper records. This leads to missed payments, administrative overhead, inaccurate financial tracking, and a lack of professional management. PG-Pal replaces this chaos with a single, centralized, and automated digital solution.

## ✨ Core Features

### 🏢 Multi-Tenant SaaS Architecture
- **Secure Data Isolation**: A robust multi-owner system where each PG owner's data is completely isolated and secure.
- **Super Admin Dashboard**: A central dashboard for the software owner to manage all registered client accounts, with the ability to activate or deactivate them.
- **Public Registration**: A clean sign-up page allows new PG owners to easily register for the service.

### 💰 Automated Billing & Financials
- **Intelligent Anniversary-Date Billing**: Automatically generates monthly dues for each tenant based on their specific joining date, ensuring accurate pro-rated billing cycles.
- **Automated SMS Reminders**: A daily cron job (powered by Twilio) sends payment reminders to tenants and "Payment Received" confirmations upon successful transactions.
- **Comprehensive Expense Tracking**: A dedicated module for owners to log all business expenses like utilities, salaries, maintenance, and more.
- **Profit & Loss Reporting**: A powerful, interactive reports page that calculates total income, expenses, and true net profit/loss for any selected month and property, visualized with clean charts.

### 👤 Complete Tenant Lifecycle Management
- **Smart Onboarding**: Automatically back-fills all previous months' due payments when adding a tenant with a past joining date.
- **Full CRUD Operations**: Owners can Add, Edit, Vacate, Transfer (between rooms), and Permanently Delete tenants.
- **Detailed Tenant Profiles**: A dedicated profile page for each tenant showing their complete payment history, stay details, and contact information.
- **Active & Vacated Views**: A filterable directory allows owners to easily view and manage lists of both currently active and previously vacated tenants.

### 🏗️ Advanced Property Management
- **Hierarchical Floor Plan**: An intuitive "Floor Plan" view displays the property structure, grouped by floor, with a real-time occupancy status for every bed.
- **Rapid Setup Wizard**: A powerful "Bulk Add" tool allows owners to set up an entire multi-floor building with all its rooms and beds in minutes.
- **Full CRUD for Properties**: Owners have complete control to add, edit, and delete their properties, rooms, and individual beds as their business evolves.

## 🛠️ Technology Stack

| Area      | Technology                                                                                                                              |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | `React (Vite)`, `Tailwind CSS`, `Shadcn/ui`, `Recharts`, `Framer Motion`                                                                  |
| **Backend** | `Node.js`, `Express.js`                                                                                                                 |
| **Database** | `MongoDB` with `Mongoose` (leveraging transactions and partial indexes for performance and data integrity)                              |
| **Integrations** | `Twilio` for SMS notifications                                                                                                      |
| **Architecture** | `Monorepo` (single GitHub repository for both frontend and backend)                                                                  |

***

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need the following software installed on your machine:
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (a local instance or a cloud URI from MongoDB Atlas)
- Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/pg-pal.git](https://github.com/your-username/pg-pal.git)
    cd pg-pal
    ```

2.  **Install dependencies from the root directory:**
    ```bash
    npm install
    ```

3.  **Set up Backend Environment Variables:**
    Create a `.env` file in the `/packages/server` directory by copying the example file.
    ```bash
    cp packages/server/.env.example packages/server/.env
    ```
    Now, fill in the necessary variables in `packages/server/.env`:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key

    TWILIO_ACCOUNT_SID=your_twilio_account_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_PHONE_NUMBER=your_twilio_phone_number
    ```

4.  **Set up Frontend Environment Variables:**
    Create a `.env` file in the `/packages/client` directory.
    ```bash
    cp packages/client/.env.example packages/client/.env
    ```
    Fill in the API base URL in `packages/client/.env`:
    ```env
    VITE_API_BASE_URL=http://localhost:5000
    ```

5.  **Run the application:**
    From the root directory, run the development script to start both the backend server and the frontend client concurrently.
    ```bash
    npm run dev
    ```
    - The React app will be available at `http://localhost:5173`.
    - The Node.js server will be running on `http://localhost:5000`.
```
pg-pal/
├── packages/
│   ├── client/       # React Frontend (Vite)
│   │   ├── public/
│   │   ├── src/
│   │   ├── .env.example
│   │   └── package.json
│   └── server/       # Node.js Backend (Express)
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── .env.example
│       └── package.json
├── .gitignore
├── package.json      # Root package.json with scripts
└── README.md
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

      

