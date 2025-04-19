
# MarketOnStreetMall Vendor Backend

🎉 **MarketOnStreetMall Vendor Backend** is the core backend service for the MarketOnStreetMall Vendor Dashboard. It provides secure API endpoints for vendor registration, product management, order handling, and admin workflows. Built with **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**, the system is robust, scalable, and optimized for real-world vendor operations.

---

## 📑 Features

- Vendor & Admin Authentication  
- Product Submission & Approval Workflow  
- Role-Based Access Control (Vendor Admin & Product Admin)  
- Product History Logging with Timestamps and Actions  
- Order Management & Status Tracking  
- Shipment Flow Managed via Shiprocket Integration  
- Weekly & Monthly Sales Report Generation  
- Dashboard Analytics with Graphs and Metrics  
- Sub-User Management within Vendor Accounts  
- Mobile, Tablet, and Desktop Responsive UI  
- Secure REST APIs with Zod Validation  
- Admin Control Over Product Pricing & Approvals  

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v16+ recommended)
- **npm**
- **PostgreSQL**
- **Prisma CLI**: Install with `npm install -g prisma`

---

### 🛠 Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/YOUR_ORG/marketonstreetmall-vendor-backend.git
   cd marketonstreetmall-vendor-backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory and add:

   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/marketonstreetmall"
   JWT_SECRET="your_secret_key"
   PORT=5000
   SHIPROCKET_API_KEY="your_shiprocket_api_key"
   SHIPROCKET_API_SECRET="your_shiprocket_api_secret"
   ```

4. **Set up the database**:

   Run Prisma migration:

   ```bash
   npx prisma migrate dev --name init
   ```

   Generate Prisma client:

   ```bash
   npx prisma generate
   ```

---

### 🏃 Running the Application

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 📂 Project Structure

```
marketonstreetmall-vendor-backend/
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma
├── src/
│   ├── api/v1/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── router/
│   │   ├── service/
│   │   ├── utils/
│   │   └── validations/
│   ├── app.ts
│   └── server.ts
├── config/
├── .env
├── package.json
├── tsconfig.json
├── README.md
└── nodemon.json
```

---

## 🔧 Tech Stack

- **Node.js**
- **Express.js**
- **Prisma ORM**
- **PostgreSQL**
- **JWT**
- **Zod**
- **Shiprocket API**

---

### 🔑 Environment Variables

```bash
DATABASE_URL="your_postgres_connection_string"
JWT_SECRET="your_secret_key"
PORT=5000
SHIPROCKET_API_KEY="your_shiprocket_api_key"
SHIPROCKET_API_SECRET="your_shiprocket_api_secret"
```

---

### 🔄 Future Enhancements

- Vendor Analytics Dashboard
- Audit Logs for Product Status Changes
- Admin Notification Center

---

### 🛡 Security

- JWT Auth with Role-Based Access
- API Rate Limiting
- Input Validation with Zod
- Environment-specific Configurations

---

### 💡 Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

### 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file.

---

### 📞 Contact

For questions or support, contact us at:

- **Email**: support@marketonstreetmall.com
- **GitHub**: [Vendor Backend](https://github.com/YOUR_ORG/marketonstreetmall-vendor-backend)
