🎵 Music Tutor Marketplace
Project Description

The Music Tutor Marketplace is a full-stack web application that allows music tutors to advertise their services and students to browse available tutors.

Tutors can register accounts, log in securely, and create, edit, or delete their own tutoring advertisements. Students can browse all ads, search by keyword, and filter tutors by instrument and location.

The project demonstrates core full-stack development concepts including:

Frontend state management with React
RESTful API design
Database modelling with Sequelize and PostgreSQL
Authentication and authorization using HTTP-only cookies
Serverless backend deployment using Netlify Functions


✨ Key Features

Public (Students)

View all tutor advertisements
Filter tutors by instrument and suburb
Search by name, instrument, or description
View tutor availability (read-only)
Responsive and accessible UI

Tutors (Authenticated)

Create a tutor account
Login and logout securely
Create new tutor advertisements
Edit and delete only their own advertisements
Dashboard for managing ads


🛠️ Technologies Used

Frontend

React (Vite)
Tailwind CSS
Radix UI components
Lucide Icons

Backend

Node.js
Express
Sequelize ORM
PostgreSQL

Netlify Functions (serverless)

Authentication & Security
HTTP-only cookies
Password hashing with bcrypt
Ownership-based authorization
CORS configuration
Rate limiting and security headers


📁 Project Structure
├── src/
│   ├── components/        # React components
│   ├── utils/             # Helper utilities
│   ├── App.jsx            # Main application entry
│
├── netlify/
│   └── functions/
│       ├── controllers/   # API logic
│       ├── middleware/    # Auth & security middleware
│       ├── models/        # Sequelize models
│       ├── routes/        # Express routes
│       └── api.mjs        # Netlify serverless entry
│
├── netlify.toml           # Netlify configuration
├── package.json
└── README.md

⚙️ Installation Instructions
Prerequisites

Ensure the following are installed on your system:

Node.js (v18 or higher recommended)

npm

PostgreSQL

Netlify CLI

Install Netlify CLI if not already installed:
npm install -g netlify-cli

Step 1: Install Dependencies

From the project root directory, run:
npm install


Step 2: Environment Setup

Ensure your PostgreSQL database is running and that environment variables (database connection details) are correctly configured for Sequelize.

The database will automatically initialize and sync on first run.

▶️ Running the Application
Start the App (Frontend + Backend)
npm run dev


This command runs:

Frontend (Vite) on:
👉 http://localhost:5173

Backend (Netlify Functions) on:
👉 http://localhost:8888/api

All API requests from the frontend are proxied through Netlify to the backend.


🔐 Authentication Notes

Tutors must be logged in to create, edit, or delete advertisements
Authentication uses HTTP-only cookies
Tutor ownership is enforced server-side
Users cannot modify ads they do not own


🚧 Known Limitations / Future Improvements

Editable availability slots
Tutor profile editing
Student reviews and ratings
Image uploads
Pagination for large data sets


👤 Author

Sebastian Gordon

This project was developed to demonstrate:

Full-stack application architecture
Secure authentication and authorization
Database-driven CRUD functionality
Clean, maintainable React UI design