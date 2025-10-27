# 🧩 Bookmark Manager - Backend (Node.js + Express + MongoDB)

This is the **backend service** for the Bookmark Manager web application - a complete RESTful API built with **Node.js, Express, and MongoDB**.
It handles **user authentication**, **bookmark CRUD operation**, and **data storage** for the frontend built in React (Vite).

---

## 🌟 Key Features
- 🔐**User Authentication & Authorization** (JWT-based login/signup)
- 📌**Bookmark Management** - Create, Read, Update, Delete bookmarks
- 📊**MondoDB Integration** - Persistent storage for users and bookmarks
- ⚙️**Modular Codebase** - Separate layers for routes, controllers, models, and middleware
- ⚠️**Error Handling & Validation** - Centralized error responses
- 🌐**CORS Enabled** - Frontend and backend communication supported
- 🚀**Scalable REST API Design**

---
## 🛠️ Tech Stack
- **Backend Framework:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JWT + bcrypt password hashing
- **Environment Config:** dotenv
- **Deployement:** Render

---
## ⛮ Setup & Run Locally 
Clone the repository and install dependencies:

```
git clone
https//github.com/satwinder9069/bookmark-manager-backend.git
cd bookmark-manager-backend
npm install
npm run dev
```
and in the .env file, update:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Then visit http://localhost:5000 or the deployed link.

---
## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|-----------|--------------|----------------|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login existing user | ❌ |

### 🔖 Bookmarks
| Method | Endpoint | Description | Auth Required |
|--------|-----------|--------------|----------------|
| GET | `/api/bookmarks` | Get all bookmarks for logged-in user | ✅ |
| POST | `/api/bookmarks` | Create a new bookmark | ✅ |
| PUT | `/api/bookmarks/:id` | Update a bookmark | ✅ |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark | ✅ |

🧠 **Headers for protected routes:**
Authorization: Bearer <token> Content-Type: application/json

---
## 📂 Folder Structure
```
bookmark-manager-backend/
 ├── controllers/      # Business logic
 ├── models/           # Mongoose schemas
 ├── routes/           # API endpoints
 ├── middleware/       # Auth & error handling
 ├── server.js         # App entry point
 ├── package.json
 └── .env
```
---
## 🧪 Future Enhancements
  - 📂 Folder based bookmark organization
  - 🧠 AI-based bookmark categorization (using Gemini/OpenAI API)
  - 🔔 User notification & reminders
---

👉🏻 Part of the Bookmark Manager (MERN Stack) full-stack project.

📍 Frontend Repo -> [Bookmark Manager Frontend](https://github.com/satwinder9069/bookmark-manager-frontend)

---
