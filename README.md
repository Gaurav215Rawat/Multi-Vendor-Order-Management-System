# Multi-Vendor-Order-Management-System
This is the backend for a Vendor Management System built with **Node.js**, **Express**, and **MongoDB**.

## 📁 Project Structure
Vendor_Backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── .env
├── package.json
└── server.js

You can use Postman or similar tools to test these endpoints:

Login: POST /api/auth/login and signup  - 
role-:
// admin
// vendor
// customer

Vendor Sales: GET /api/analytics/vendor/sales (requires vendor token)

and other apis 

I have attached an Postman json file you can use it 

Make sure to include the JWT token in the Authorization header:


## 🚀 Features

- User authentication & role-based authorization
- Order management with support for sub-orders
- Sales analytics per vendor
- Middleware for request validation
- Secure API routing

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/vendor-backend.git
cd vendor-backend

npm install
npm install -g nodemon
nodemon index.js 
Server will start running 5000
