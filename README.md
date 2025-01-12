# Bicycle Shop - Full Stack Application

## 📌 Overview
The Bicycle Shop is a full-stack web application that allows users to browse, customize, and purchase bicycles. The application consists of a **React** frontend and an **Express.js / Node.js** backend, with **MongoDB** as the database. The system supports customizable bicycle parts, cart management, and an admin panel for managing products and restrictions.

## 🚀 Features
### **Frontend (React.js)**
- Browse bicycles with customization options.
- Dynamic selection of bicycle parts with restriction validation.
- Add bicycles with specific configurations to the cart.
- Cart persistence using localStorage.
- Admin panel to manage bicycle parts and restrictions.
- Fully responsive UI with Bootstrap & SCSS.
- Unit and integration testing using **Jest** and **React Testing Library**.
- End-to-end testing setup with **Cypress**.

### **Backend (Node.js, Express.js, MongoDB)**
- RESTful API endpoints for bicycles, parts, and cart.
- Validation for part compatibility using predefined restrictions.
- CRUD operations for bicycles and parts.
- Error handling and logging.
- Secure database operations with **Mongoose ORM**.

## 🛠️ Technologies Used
### **Frontend**
- React 18
- React Router
- Bootstrap 5
- React Select
- React Toastify
- SCSS
- Jest & React Testing Library (Unit & Integration tests)
- Cypress (End-to-End tests)

### **Backend**
- Node.js
- Express.js
- MongoDB with Mongoose
- Dotenv for environment variables
- Jest & Supertest for API testing
- MongoDB Memory Server for isolated test database

## 🏗️ Project Setup

### **1️⃣ Backend Setup**
```sh
cd backend
npm install
```
- **Environment Variables:** Create a `.env` file and add:
  ```env
  MONGO_URI=your_mongodb_connection_string
  PORT=5001
  ```
- **Run the Server:**
  ```sh
  npm run dev
  ```

### **2️⃣ Frontend Setup**
```sh
cd frontend
npm install
```
- **Run the Frontend:**
  ```sh
  npm start
  ```
- **Open** [http://localhost:3000](http://localhost:3000) in your browser.
- **Admin Panel:** Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

## 🧪 Testing

### **Unit & Integration Tests**
#### **Backend**
```sh
cd backend
npm test
```
#### **Frontend**
```sh
cd frontend
npm test
```

### **End-to-End (E2E) Tests with Cypress**
```sh
cd frontend
npx cypress open
```
If Cypress can't connect, try:
```sh
npx cypress open --config baseUrl=http://127.0.0.1:3000
```

## 📂 Folder Structure
```
📦 bicycle-shop
 ┣ 📂 backend
 | ┣ 📂 src
 ┃ ┣ ┣ 📂 controllers
 ┃ ┣ ┣ 📂 middleware
 ┃ ┣ ┣ 📂 models
 ┃ ┣ ┣ 📂 routes
 ┃ ┣ ┣ 📂 tests
 ┣ 📂 frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 api
 ┃ ┃ ┣ 📂 components
 ┃ ┃ ┣ 📂 context
 ┃ ┃ ┣ 📂 pages
```

## 🚀 What We Developed
✅ **Backend:**
- API to handle bicycles, parts, and restrictions.
- Validation for part compatibility.
- Full test coverage for controllers & models.

✅ **Frontend:**
- Bicycle customization UI with restricted selections.
- Admin panel to manage parts and restrictions.
- Cart management with localStorage persistence.
- Full unit and integration test coverage.

✅ **Testing:**
- Unit tests for both frontend & backend.
- Cypress E2E tests for UI and API interactions.

## 📧 Contact
If you have any questions, feel free to reach me out!

Marcela Vilas Boas

