# POS System API

## 📌 Introduction
This is the API documentation for the POS (Point of Sale) system. Below are all available endpoints categorized by functionality.

---

## 🛠️ **Setup Instructions**

### **1️⃣ Install Dependencies**
```sh
npm install
```

### **2️⃣ Start the Server**
```sh
npm start
```

### **3️⃣ Environment Variables**
Ensure you have a `.env` file with the required database and configuration settings.

---

## 🚀 **API Endpoints**

### 🧑‍💼 **Customer API**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/customers` | Create a new customer |
| `GET`  | `/api/customers` | Get all customers |
| `GET`  | `/api/customers/:id` | Get a customer by ID |
| `PUT`  | `/api/customers/:id` | Update a customer by ID |
| `DELETE` | `/api/customers/:id` | Delete a customer by ID |
| `POST` | `/api/customers/payment` | Record a customer payment |

---

### 📦 **Product API**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/products` | Create a new product |
| `GET`  | `/api/products` | Get all products |
| `GET`  | `/api/products/:id` | Get a product by ID |
| `PUT`  | `/api/products/:id` | Update a product by ID |
| `DELETE` | `/api/products/:id` | Delete a product by ID |

---

### 🧾 **Invoice API**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/invoices` | Create a new invoice |
| `GET`  | `/api/invoices` | Get all invoices |
| `GET`  | `/api/invoices?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Get invoices in a date range |


### 🔑 **Authentication API**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/change-password` | Change user password |

---

## ⚡ **Response Format**
All responses follow this structure:
```json
{
  "status": "success",
  "message": "Description of the response",
  "data": { ... }
}
```
For errors:
```json
{
  "status": "error",
  "message": "Error description",
  "data": { ... }
}
```

---

## 🔥 **Additional Features**
- ✅ JWT Authentication for security
- ✅ MongoDB Transactions for consistency
- ✅ Request validation for clean data input
- ✅ Error and success responses handled centrally

---

## 📩 **Contact & Support**
For any questions, feel free to reach out!

